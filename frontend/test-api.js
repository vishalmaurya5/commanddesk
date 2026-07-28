

async function main() {
  try {
    const response = await fetch("http://localhost:3000/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test.api123@example.com",
        firstName: "Test",
        lastName: "API",
        role: "EMPLOYEE",
        departmentId: "",
        designation: "Developer",
        phone: "1234567890",
      }),
    });
    
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

main();
