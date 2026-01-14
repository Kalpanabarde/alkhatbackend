import { useState, useEffect } from "react";
import ServiceCard from "./ServiceCard";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function ServicePage() {
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  const navigate = useNavigate();
  const location = useLocation();
  const customer = location.state;

  useEffect(() => {
    const fetchServices = async () => {
      try {
       
        const res = await axios.get(
          "https://beautiful-achievement-production.up.railway.app/api/service",
          
        );

        setServices(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError("Failed to load services. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleSelect = () => {
    if (!selectedService) {
      alert("Please select a service first!");
      return;
    }

    navigate("/payment", {  replace: true, 
      state: {
        data: customer,
        service: selectedService.label,
        price: selectedService.price,
        serviceId: selectedService._id,
      },
    });
  };

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: 50 }}>Loading services...</div>;
  }

  if (error) {
    return <div style={{ textAlign: "center", marginTop: 50, color: "red" }}>{error}</div>;
  }

  return (
    <div style={{
      maxWidth: 700,
      margin: "50px auto",
      padding: 25,
      borderRadius: 16,
      backgroundColor: "#fff",
      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    }}>
      <h2 style={{ textAlign: "center", marginBottom: 30 }}>Select Service</h2>

      {selectedService && (
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 25,
          padding: "12px 20px",
          borderRadius: 12,
          boxShadow: "0 4px 10px rgba(0,128,0,0.2)",
          fontWeight: "bold",
        }}>
          <img
            src={`https://alkhat-carwash.onrender.com/icons/${selectedService.icon}`}
            alt={selectedService.label}
            style={{ width: 50, marginRight: 15 }}
          />
          {selectedService.label} - AED{selectedService.price}
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 20,
      }}>
        {services.map((item) => (
          <ServiceCard
            key={item._id}
            label={item.label}
            icon={`https://alkhat-carwash.onrender.com/icons/${item.icon}`}
            price={item.price}
            selected={selectedService?._id === item._id}
            onClick={() => setSelectedService(item)}
          />
        ))}
      </div>

      <button
        onClick={handleSelect}
        style={{
          marginTop: 35,
          width: "100%",
          padding: 15,
          fontSize: 16,
          fontWeight: "bold",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
        }}
      >
        Select & Proceed
      </button>
    </div>
  );
}
