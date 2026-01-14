import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import axios from "axios";

export default function PersonalDetail() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerCode: "",
    name: "",
    phone: "",
    quantity: ""
  });

  const [isExisting, setIsExisting] = useState(false);
  const [cars, setCars] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [carForm, setCarForm] = useState({ carName: "", carNumber: "" });
  const [selectedCars, setSelectedCars] = useState([]);
  const [multipleMatches, setMultipleMatches] = useState([]);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  const fetchTimeout = useRef(null);

  // ===============================
  // Check customer (debounced)
  // ===============================
  const fetchCustomerData = async (triggerField) => {
    if (!formData.customerCode && !formData.name.trim()) return;

    const params = formData.customerCode
      ? { customerCode: formData.customerCode.trim() }
      : { name: formData.name.trim() };

    setLoadingCustomer(true);

    try {
      const res = await axios.get(
        "https://alkhat-carwash.onrender.com/api/customer/by-customerCode",
        { params }
      );

      if (res.data.exists) {
        if (res.data.multiple) {
          setMultipleMatches(res.data.data);
          setIsExisting(false); // wait for user to pick
        } else {
          const customer = res.data.data;
          setFormData(prev => ({
            ...prev,
            customerCode: customer.customerCode,
            name: customer.name,
            phone: customer.phone || ""
          }));
          setCars(customer.cars || []);
          setSelectedCars(customer.cars ? customer.cars.map((_, i) => i) : []);
          setIsExisting(true);
          setMultipleMatches([]);
        }
      } else {
        setIsExisting(false);
        setMultipleMatches([]);
        setCars([]);
        setSelectedCars([]);
      }
    } catch (err) {
      console.error("Error fetching customer:", err);
    } finally {
      setLoadingCustomer(false);
    }
  };

  const handleBlur = (field) => {
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    fetchTimeout.current = setTimeout(() => fetchCustomerData(field), 300);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ===============================
  // Handle multiple selection
  // ===============================
  const selectCustomerFromMultiple = (customer) => {
    setFormData({
      customerCode: customer.customerCode,
      name: customer.name,
      phone: customer.phone || "",
      quantity: formData.quantity
    });
    setCars(customer.cars || []);
    setSelectedCars(customer.cars ? customer.cars.map((_, i) => i) : []);
    setMultipleMatches([]);
    setIsExisting(true);
  };

  // ===============================
  // Car modal handlers
  // ===============================
  const openAddCar = () => {
    setCarForm({ carName: "", carNumber: "" });
    setEditIndex(null);
    setShowDialog(true);
  };

  const openEditCar = (index) => {
    setCarForm(cars[index]);
    setEditIndex(index);
    setShowDialog(true);
  };

  const saveCar = () => {
    if (!carForm.carName || !carForm.carNumber) {
      alert("Fill all fields");
      return;
    }

    if (editIndex !== null) {
      const updated = [...cars];
      updated[editIndex] = carForm;
      setCars(updated);
    } else {
      const updated = [...cars, carForm];
      setCars(updated);
      setSelectedCars(prev => [...prev, updated.length - 1]);
    }

    setShowDialog(false);
    setCarForm({ carName: "", carNumber: "" });
    setEditIndex(null);
  };

  const deleteCar = () => {
    const updated = cars.filter((_, i) => i !== editIndex);
    setCars(updated);
    setSelectedCars(prev =>
      prev.filter(i => i !== editIndex).map(i => (i > editIndex ? i - 1 : i))
    );
    setShowDialog(false);
    setEditIndex(null);
  };

  // ===============================
  // Submit
  // ===============================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedCars.length === 0) {
      alert("Please select at least one car");
      return;
    }

    const selectedCarDetails = selectedCars.map((i) => ({
      carName: cars[i].carName,
      carNumber: cars[i].carNumber
    }));

    const finalData = {
      customerCode: formData.customerCode,
      name: formData.name,
      phone: formData.phone || null,
      quantity: Number(formData.quantity),
      cars: selectedCarDetails
    };

    navigate("/service", { replace: true, state: finalData });
  };

  // ===============================
  // Render
  // ===============================
  return (
    <form className="personal-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Personal Details</h2>

      <div className="form-group">
        <label>Customer Id</label>
        <input
          type="text"
          name="customerCode"
          placeholder="Enter Customer ID"
          value={formData.customerCode}
          onChange={handleChange}
          onBlur={() => handleBlur("customerCode")}
        />
        {loadingCustomer && <small>Checking customer...</small>}
        {formData.customerCode && !loadingCustomer && (
          <small style={{ color: isExisting ? "green" : "gray" }}>
            {isExisting ? "✔ Existing Customer" : "➕ New Customer"}
          </small>
        )}
      </div>

      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          name="name"
          placeholder="Customer name"
          value={formData.name}
          onChange={handleChange}
          onBlur={() => handleBlur("name")}
        />
      </div>

      {multipleMatches.length > 0 && (
        <div className="multiple-selection">
          <p>Multiple customers found. Please select one:</p>
          <div className="customer-cards">
            {multipleMatches.map((c, idx) => (
              <div
                key={idx}
                className={`customer-card ${formData.customerCode === c.customerCode ? "selected" : ""}`}
                onClick={() => selectCustomerFromMultiple(c)}
              >
                <input
                  type="radio"
                  name="selectedCustomer"
                  checked={formData.customerCode === c.customerCode}
                  readOnly
                />
                <div className="customer-info">
                  <strong>{c.name}</strong>
                  <p>Customer ID: {c.customerCode}</p>
                  <p>Phone: {c.phone || "No phone"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Phone Number (optional)</label>
        <input
          type="tel"
          name="phone"
          placeholder="Enter phone number"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Car Details</label>
        {cars.length > 0 ? (
          <div className="car-list">
            {cars.map((car, index) => (
              <label key={index} className="car-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCars.includes(index)}
                  onChange={() =>
                    setSelectedCars(prev =>
                      prev.includes(index)
                        ? prev.filter(i => i !== index)
                        : [...prev, index]
                    )
                  }
                />
                {car.carName} - {car.carNumber}
                <button type="button" className="car-checkbox" onClick={() => openEditCar(index)} style={{ marginLeft: "10px" }}>
                  Edit
                </button>
              </label>
            ))}
            <button type="button" onClick={openAddCar} className="submit-btn">
              + Add Another Car
            </button>
          </div>
        ) : (
          <button type="button" onClick={openAddCar} className="submit-btn">
            + Add Car
          </button>
        )}
      </div>

      <div className="form-group">
        <label>Quantity</label>
        <select
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        >
          <option value="">Select quantity</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(q => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="submit-btn" disabled={loadingCustomer}>
        {loadingCustomer ? "Checking..." : "Continue"}
      </button>

      {/* Car modal */}
      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>{editIndex !== null ? "Edit Car" : "Add Car"}</h3>
            <input
              type="text"
              placeholder="Car Name"
              value={carForm.carName}
              onChange={(e) => setCarForm({ ...carForm, carName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Car Number"
              value={carForm.carNumber}
              onChange={(e) => setCarForm({ ...carForm, carNumber: e.target.value })}
            />
            <div className="dialog-actions">
              <button type="button" onClick={saveCar} className="save-btn">
                {editIndex !== null ? "Update" : "Add"}
              </button>
              {editIndex !== null && (
                <button type="button" onClick={deleteCar} className="delete-btn">
                  Delete
                </button>
              )}
              <button type="button" onClick={() => setShowDialog(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
