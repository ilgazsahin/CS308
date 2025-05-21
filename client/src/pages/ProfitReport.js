
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ProfitDashboard = () => {
  const role = localStorage.getItem("role");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totals, setTotals] = useState({ revenue: 0, cost: 0, profit: 0 });

  useEffect(() => {
    if (role === "sales manager") {
      axios.get("http://localhost:3001/api/orders")
        .then(res => setOrders(res.data))
        .catch(err => console.error("Error fetching orders", err));
    }
  }, [role]);

  const calculateProfit = () => {
    if (!startDate || !endDate) {
      alert("Please select a valid date range.");
      return;
    }

    const filtered = orders.filter(order => {
      const orderDate = new Date(order.orderDate || order.createdAt);
      return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    });

    let revenue = 0, cost = 0;
    filtered.forEach(order => {
      order.items.forEach(item => {
        const totalPrice = item.price * item.quantity;
        const estimatedCost = (item.cost ?? item.price * 0.5) * item.quantity;
        revenue += totalPrice;
        cost += estimatedCost;
      });
    });

    setFilteredOrders(filtered);
    setTotals({ revenue, cost, profit: revenue - cost });
  };

  if (role !== "sales manager") {
    return <h2 style={{ padding: "100px", textAlign: "center" }}>Access Denied</h2>;
  }

  // Prepare daily data for BarChart
  const dailyMap = {};
  filteredOrders.forEach(order => {
    const dateKey = new Date(order.orderDate || order.createdAt)
      .toISOString()
      .slice(0, 10);
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = { date: dateKey, revenue: 0, cost: 0 };
    }
    order.items.forEach(item => {
      dailyMap[dateKey].revenue += item.price * item.quantity;
      dailyMap[dateKey].cost += (item.cost ?? item.price * 0.5) * item.quantity;
    });
  });
  const barData = Object.values(dailyMap)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(d => ({ ...d, profit: d.revenue - d.cost }));

  return (
    <div style={{ padding: "60px", backgroundColor: "var(--light-bg)", minHeight: "100vh" }}>
      <div className="container">
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          color: "var(--primary-color)",
          fontSize: "2rem",
          marginBottom: "30px"
        }}>
          Profit Dashboard
        </h2>

        {/* Date Range Picker */}
        <div style={{ marginBottom: "30px", display: "flex", gap: "20px" }}>
          <div>
            <label>Start Date</label><br />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label>End Date</label><br />
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          <div style={{ alignSelf: "end" }}>
            <button
              onClick={calculateProfit}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "6px"
              }}
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Summary */}
        <div style={{ marginBottom: "30px" }}>
          <h3>Summary</h3>
          <p><strong>Total Revenue:</strong> ${totals.revenue.toFixed(2)}</p>
          <p><strong>Total Cost:</strong> ${totals.cost.toFixed(2)}</p>
          <p><strong>Profit:</strong> ${totals.profit.toFixed(2)}</p>
        </div>

        {/* Bar Chart: Revenue, Cost & Profit */}
        <div style={{ marginBottom: "30px" }}>
          <h3>Daily Revenue, Cost & Profit</h3>
          {barData.length > 0 ? (
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart
                  data={barData}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ReTooltip formatter={value => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#0088FE" barSize={16} />
                  <Bar dataKey="cost"    name="Cost"    fill="#FF8042" barSize={16} />
                  <Bar dataKey="profit"  name="Profit"  fill="#00C49F" barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p>No data in selected range.</p>
          )}
        </div>

        {/* Detailed Order List */}
        <div>
          <h3>Orders in Range: {filteredOrders.length}</h3>
          {filteredOrders.map(order => (
            <div
              key={order._id}
              style={{
                background: "white",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "6px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
              }}
            >
              <p><strong>Order ID:</strong> {order._id}</p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.orderDate || order.createdAt).toLocaleString()}
              </p>
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.title} – Qty: {item.quantity} – Price: $
                    {item.price.toFixed(2)} – Cost: $
                    {((item.cost ?? item.price * 0.5) * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfitDashboard;
