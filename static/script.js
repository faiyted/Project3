function loadData() {
    d3.json('/csv_to_json')
        .then(data => {
            displayData(data);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
}

// Function to display the JSON data in an HTML table
function displayData(data) {
    const tableHeader = d3.select("#table-header");
    const tableBody = d3.select("#table-body");

    // Clear previous data
    tableHeader.html("");
    tableBody.html("");

    if (data.length > 0) {
        // Create table headers
        const headers = Object.keys(data[0]);
        headers.forEach(header => {
            tableHeader.append("th").text(header);
        });

        // Create table rows
        data.forEach(row => {
            const tr = tableBody.append("tr");
            headers.forEach(header => {
                const value = row[header] !== null ? row[header] : "None"; // Handle null
                tr.append("td").text(value);
            });
        });
    }
}