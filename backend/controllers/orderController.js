const Customer = require("../models/Customer");
const Order = require("../models/Order");

/* ================= CHECK CUSTOMER ================= */


/* ================= CHECK CUSTOMER BY CUSTOMER ID ================= */
exports.checkCustomerByCode = async (req, res) => {
  try {
    const { customerCode, name } = req.query;

    if (!customerCode && !name) {
      return res
        .status(400)
        .json({ message: "Customer code or name required" });
    }

    let customer = null;

    /* ---------- 1️⃣ Try by customerCode ---------- */
    if (customerCode) {
      customer = await Customer.findOne({ customerCode });
    }

    /* ---------- 2️⃣ Fallback: try by name ---------- */
    if (!customer && name) {
      const customers = await Customer.find({
        name: { $regex: name.trim(), $options: "i" }

        //name: { $regex: `^${name.trim()}$`, $options: "i" },
      });

      if (customers.length === 0) {
        return res.json({ exists: false });
      }

      // If multiple customers with same name
      if (customers.length > 1) {
        return res.json({
          exists: true,
          multiple: true,
          data: customers.map(c => ({
            id: c._id,
            name: c.name,
            customerCode: c.customerCode,
            phone: c.phone || null,
            cars: c.cars,
          })),
        });
      }

      customer = customers[0];
    }

    if (!customer) {
      return res.json({ exists: false });
    }

    /* ---------- 3️⃣ Latest order ---------- */
    const latestOrder = await Order.findOne({ customer: customer._id })
      .sort({ createdAt: -1 });

    res.json({
      exists: true,
      data: {
        id: customer._id,
        name: customer.name,
        customerCode: customer.customerCode,
        phone: customer.phone || null, // optional
        cars: customer.cars,
        lastOrderAt: latestOrder?.createdAt || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/* ================= CREATE ORDER ================= */
/* ================= CREATE ORDER ================= */
exports.createOrder = async (req, res) => {
  try {
    const { service, data, TotalPrice, paymentMethod, paymentStatus } = req.body;

    // ✅ Validate required fields
    if (
      !service ||
      !data?.customerCode ||
      !data?.name ||
      data?.quantity == null ||
      !Array.isArray(data.cars) ||
      !TotalPrice ||
      !paymentMethod
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ------------------
    // 1️⃣ Find or create customer safely
    // ------------------
    let customer = await Customer.findOne({ customerCode: data.customerCode });

    if (!customer) {
      // Create new customer
      const customerData = {
        customerCode: data.customerCode,
        name: data.name,
        cars: data.cars,
      };
      if (data.phone) customerData.phone = data.phone;

      customer = await Customer.create(customerData);
    } else {
      // Update only if there is a real change
      let needSave = false;

      if (JSON.stringify(customer.cars) !== JSON.stringify(data.cars)) {
        customer.cars = data.cars;
        needSave = true;
      }

      if (data.phone && data.phone !== customer.phone) {
        customer.phone = data.phone;
        needSave = true;
      }

      if (needSave) {
        await customer.save(); // Only save if something changed
      }
    }

    // ------------------
    // 2️⃣ Create order with unique invoice
    // ------------------
    const invoiceNo = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await Order.create({
      invoiceNo,
      customer: customer._id, // relation as ObjectId
      service,
      bill: {
        quantity: data.quantity,
        totalAmount: TotalPrice,
      },
      payment: {
        method: paymentMethod.toLowerCase(),
        status: paymentStatus === "paid" ? "paid" : paymentStatus || "pending",
      },
    });

    // ------------------
    // 3️⃣ Populate customer details for frontend
    // ------------------
    const populatedOrder = await Order.findById(order._id).populate("customer");

    // ------------------
    // 4️⃣ Send response
    // ------------------
    res.status(201).json({
      message: "Order saved successfully",
      invoiceNo: populatedOrder.invoiceNo,
      data: populatedOrder,
    });
  } catch (err) {
    console.error("Create order error:", err.message);

    // Handle duplicate key errors more gracefully (unlikely now)
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Duplicate key error. A customer with this phone already exists.",
        error: err.keyValue,
      });
    }

    res.status(500).json({ error: err.message });
  }
};




/* ================= GET ORDER BY ID ================= */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "ID required" });

    // Fetch order and populate customer details
    const order = await Order.findById(id).populate("customer");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




/* ================= GET ALL ORDERS ================= */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ================= GET ALL CUSTOMERS ================= */
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET CUSTOMER BY ID ================= */
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "ID required" });

    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.createCustomer = async (req, res) => {
  try {
    const { customerCode, name, phone, cars } = req.body;

    if (!customerCode || !name || !Array.isArray(cars) || cars.length === 0) {
      return res.status(400).json({
        message: "Customer code, name and cars required",
      });
    }

    const exists = await Customer.findOne({ customerCode });
    if (exists)
      return res.status(409).json({ message: "Customer already exists" });

    const customer = await Customer.create({
      customerCode,
      name,
      phone: phone || null,
      cars,
    });




    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/* ================= RESET ================= */
exports.resetOrders = async (req, res) => {
  try {
    //await Order.deleteMany({});
    //await Customer.deleteMany({});
    res.json({ message: "All orders and customers cleared." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= UPDATE ORDER BY ID ================= */
exports.updateOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { service, bill, payment } = req.body;

    if (!id) return res.status(400).json({ message: "Order ID required" });

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update only provided fields
    if (service) order.service = service;
    if (bill?.quantity !== undefined)

    //if (bill?.quantity) order.bill.quantity = bill.quantity;
    if (bill?.totalAmount) order.bill.totalAmount = bill.totalAmount;
    if (payment?.method) order.payment.method = payment.method;
    if (payment?.status) order.payment.status = payment.status;

    await order.save();

    res.json({
      message: "Order updated successfully",
      data: order,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= DELETE ORDER BY ID ================= */
exports.deleteOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "Order ID required" });

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order deleted successfully",
      deletedId: id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.updateCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerCode, name, phone, cars } = req.body;

    const customer = await Customer.findById(id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    //if (customerCode) customer.customerCode = customerCode;
    const exists = await Customer.findOne({ customerCode, _id: { $ne: id }});
if (exists) return res.status(409).json({ message: "Customer code already used" });

    if (name) customer.name = name;
    if (phone !== undefined) customer.phone = phone;
    if (Array.isArray(cars)) customer.cars = cars;

    await customer.save();

    res.json({
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Optional: delete related orders
    await Order.deleteMany({ customer: id });

    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
