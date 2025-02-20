import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const [sections, setSections] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    axios
      .get("/data/data.json")
      .then((response) => {
        const responseData = response.data;

        if (!responseData.data || !Array.isArray(responseData.data.sections)) {
          console.error("Invalid JSON structure:", responseData);
          return;
        }

        setSections(responseData.data.sections);
        calculateGrandTotal(responseData.data.sections);
      })
      .catch((error) => console.error("Error fetching JSON:", error));
  }, []);

  // Function to calculate Grand Total
  const calculateGrandTotal = (sectionsData) => {
    if (!Array.isArray(sectionsData)) {
      console.error("Invalid sections data:", sectionsData);
      return;
    }

    let total = 0;
    sectionsData.forEach((section) => {
      section.items.forEach((item) => {
        total += item.total / 100; // Divide total by 100
      });
    });
    setGrandTotal(total);
  };

  // Function to handle input change
  const handleInputChange = (sectionId, itemId, field, value) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        const updatedItems = section.items.map((item) => {
          if (item.id === itemId) {
            const updatedValue =
              field === "quantity"
                ? parseInt(value, 10) || 0
                : parseFloat(value) * 100;
            const updatedTotal =
              (field === "quantity"
                ? updatedValue * (item.unit_cost / 100)
                : item.quantity * (updatedValue / 100)) * 100;
            return { ...item, [field]: updatedValue, total: updatedTotal };
          }
          return item;
        });
        return { ...section, items: updatedItems };
      }
      return section;
    });

    setSections(updatedSections);
    calculateGrandTotal(updatedSections);
  };

  return (
    <div className="container">
      <div className="d-flex align-items-center py-4 justify-content-between">
        <h2>Estimate Summary</h2>
        <h3>Grand Total: ${grandTotal.toFixed(2)}</h3>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="section">
          <h4>{section.name}</h4>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>unit</th>
                <th>Quantity</th>
                <th>Unit Cost ($)</th>
                <th>Total ($)</th>
              </tr>
            </thead>
            <tbody>
              {section.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.item_type_display_name}</td>
                  <td>{item.unit}</td>
                  <td>
                    <input
                      type="number"
                      value={item.quantity}
                      class="form-control"
                      onChange={(e) =>
                        handleInputChange(
                          section.id,
                          item.id,
                          "quantity",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      class="form-control"
                      step="0.01"
                      value={(item.unit_cost / 100).toFixed(2)}
                      onChange={(e) =>
                        handleInputChange(
                          section.id,
                          item.id,
                          "unit_cost",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>${(item.total / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Home;
