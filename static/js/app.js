

// Download and extract the dataset
const datasetUrl = "https://www.kaggle.com/api/v1/datasets/download/waqi786/remote-work-and-mental-health";

    async function fetchAndExtractDataset() {
      try {
        // Fetch the ZIP file from Kaggle
        const response = await fetch(datasetUrl);
        if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

        const zipData = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(zipData);
        const csvFileName = Object.keys(zip.files).find(file => file.endsWith('.csv'));

        const csvContent = await zip.file(csvFileName).async('string');
        const jsonData = Papa.parse(csvContent, { header: true }).data;

        populateFilters(jsonData);
        createBubbleChart(jsonData);

      } catch (error) {
        console.error("Error fetching or extracting the dataset:", error);
      }
    }

    function populateFilters(data) {
      const mentalHealthOptions = [...new Set(data.map(d => d.Mental_Health_Condition))];
      const workLocationOptions = [...new Set(data.map(d => d.Work_Location))];
      const regionOptions = [...new Set(data.map(d => d.Region))];

      populateDropdown("mentalHealthFilter", mentalHealthOptions);
      populateDropdown("workLocationFilter", workLocationOptions);
      populateDropdown("regionFilter", regionOptions);

      document.getElementById("mentalHealthFilter").addEventListener("change", () => updateChart(data));
      document.getElementById("workLocationFilter").addEventListener("change", () => updateChart(data));
      document.getElementById("regionFilter").addEventListener("change", () => updateChart(data));
    }

    function populateDropdown(elementId, options) {
      const dropdown = document.getElementById(elementId);
      dropdown.innerHTML = `<option value="">All</option>`;
      options.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;
        dropdown.appendChild(opt);
      });
    }

    function createBubbleChart(data) {
      const filteredData = filterData(data);
      const trace = getBubbleTrace(filteredData);

      const layout = {
        title: "Region-wise Work Location and Industry - Mental Health Analysis",
        showlegend: false,
        xaxis: { title: "Industry" },
        yaxis: { title: "Work Location" },
      };

      Plotly.newPlot("bubbleChart", [trace], layout);
    }

    function getBubbleTrace(data) {
      return {
        x: data.map(d => d.Industry),
        y: data.map(d => d.Work_Location),
        text: data.map(d => `Region: ${d.Region}<br>${d.Mental_Health_Condition}`),
        mode: "markers",
        marker: {
          size: data.map(d => Math.random() * 50 + 10), // Placeholder size logic
          color: data.map(d => Math.random() * 100), // Random color scale
          colorscale: "Viridis",
          showscale: true
        }
      };
    }

    function filterData(data) {
      const mentalHealthFilter = document.getElementById("mentalHealthFilter").value;
      const workLocationFilter = document.getElementById("workLocationFilter").value;
      const regionFilter = document.getElementById("regionFilter").value;

      return data.filter(d =>
        (mentalHealthFilter === "" || d.Mental_Health_Condition === mentalHealthFilter) &&
        (workLocationFilter === "" || d.Work_Location === workLocationFilter) &&
        (regionFilter === "" || d.Region === regionFilter)
      );
    }

    function updateChart(data) {
      const filteredData = filterData(data);
      const newTrace = getBubbleTrace(filteredData);

      Plotly.react("bubbleChart", [newTrace]);
    }

    // Fetch and process the dataset on load
    fetchAndExtractDataset();