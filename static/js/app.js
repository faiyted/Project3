

// Download and extract the dataset
async function fetchAndExtractDataset() {
  const datasetUrl = "https://www.kaggle.com/api/v1/datasets/download/waqi786/remote-work-and-mental-health";
  
  try {
    // Step 1: Fetch the ZIP file from Kaggle
    const response = await fetch(datasetUrl);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
    
    const zipData = await response.arrayBuffer(); // Get ZIP as binary data
    
    // Step 2: Load and extract the ZIP using JSZip
    const zip = await JSZip.loadAsync(zipData);
    console.log("Files in the ZIP:", Object.keys(zip.files));

    // Step 3: Find and parse a JSON or CSV file
    for (const fileName of Object.keys(zip.files)) {
      if (fileName.endsWith('.json')) {
        const jsonContent = await zip.file(fileName).async('string');
        const data = JSON.parse(jsonContent);
        console.log("Parsed JSON data:", data);
      } else if (fileName.endsWith('.csv')) {
        const csvContent = await zip.file(fileName).async('string');
        console.log("CSV content:", csvContent);
      }
    }
  } catch (error) {
    console.error("Error fetching or extracting the dataset:", error);
  }
}

// Call the function to fetch and parse the dataset
fetchAndExtractDataset();
async function fetchAndConvertCSVToJSON() {
  const datasetUrl = "https://www.kaggle.com/api/v1/datasets/download/waqi786/remote-work-and-mental-health";

  try {
    // Step 1: Fetch the ZIP file
    const response = await fetch(datasetUrl);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

    const zipData = await response.arrayBuffer();

    // Step 2: Extract the ZIP using JSZip
    const zip = await JSZip.loadAsync(zipData);
    console.log("Files in the ZIP:", Object.keys(zip.files));

    // Step 3: Locate the CSV file
    const csvFileName = Object.keys(zip.files).find(file => file.endsWith('.csv'));
    const csvContent = await zip.file(csvFileName).async('string');
    console.log("CSV content:", csvContent);

    // Step 4: Convert CSV to JSON using PapaParse
    const jsonData = Papa.parse(csvContent, { header: true }).data;
    console.log("JSON Data:", jsonData);
    gender(jsonData)
    createHeatmap(jsonData)
  } catch (error) {
    console.error("Error fetching or extracting the dataset:", error);
  }
}

function gender(jsonData){
  const genderCounts = {};
    jsonData.forEach(row => {
      const gender = row["Gender"];
      if (gender) {
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
      }
    });

    const labels = Object.keys(genderCounts);
    const values = Object.values(genderCounts);

    console.log("Gender Distribution:", genderCounts);

    const data = [
      {
        type: "pie",
        labels: labels,
        values: values,
        textinfo: "label+percent",
        insidetextorientation: "radial"
      }
    ];

    const layout = {
      title: "Gender Distribution",
      height: 400,
      width: 600
    };

    Plotly.newPlot("pie-chart", data, layout);

  }

  
  function createHeatmap(jsonData) {
    const regions = [...new Set(jsonData.map(row => row["Region"]))];
    const dropdownOptions = regions.map(region => ({
      label: region,
      method: "update",
      args: [{
        visible: regions.map(r => r === region)
      }]
    }));
  
    const data = regions.map(region => {
      const filteredData = jsonData.filter(row => row["Region"] === region);
      const workLocations = [...new Set(filteredData.map(row => row["Work_Location"]))];
      const industries = [...new Set(filteredData.map(row => row["Industry"]))];
  
      const zValues = industries.map(industry => 
        workLocations.map(location => 
          filteredData.filter(row => row["Industry"] === industry && row["Work_Location"] === location).length
        )
      );
  
      return {
        x: workLocations,
        y: industries,
        z: zValues,
        type: 'heatmap',
        colorscale: 'Viridis',
        showscale: true,
        name: region,
        visible: region === regions[0] // Only the first region is visible initially
      };
    });
  
    const layout = {
      title: 'Heatmap of Work Location, Industry, and Mental Health Condition',
      xaxis: {
        title: 'Work Location'
      },
      yaxis: {
        title: 'Industry'
      },
      annotations: [],
      updatemenus: [{
        buttons: dropdownOptions,
        direction: "down",
        showactive: true
      }]
    };
  
    // Add annotations for each cell
    data.forEach((trace, traceIndex) => {
      trace.z.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          layout.annotations.push({
            x: trace.x[colIndex],
            y: trace.y[rowIndex],
            text: value,
            showarrow: false,
            font: {
              color: 'white'
            },
            visible: trace.visible
          });
        });
      });
    });
  
    Plotly.newPlot('chart', data, layout);
  }
  
fetchAndConvertCSVToJSON();