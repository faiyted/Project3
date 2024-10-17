let globalJsonData = []; // Declare a global variable to hold JSON data

async function fetchAndExtractDataset() {
  const datasetUrl = "https://www.kaggle.com/api/v1/datasets/download/waqi786/remote-work-and-mental-health";
  
  try {
    // Step 1: Fetch the ZIP file from Kaggle
    let response = await fetch(datasetUrl);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
    
    let zipData = await response.arrayBuffer(); // Get ZIP as binary data
    
    // Step 2: Load and extract the ZIP using JSZip
    let zip = await JSZip.loadAsync(zipData);
    console.log("Files in the ZIP:", Object.keys(zip.files));

    // Step 3: Find and parse a JSON or CSV file
    for (let fileName of Object.keys(zip.files)) {
      if (fileName.endsWith('.json')) {
        let jsonContent = await zip.file(fileName).async('string');
        globalJsonData = JSON.parse(jsonContent); // Store data in the global variable
        console.log("Parsed JSON data:", globalJsonData);
      } else if (fileName.endsWith('.csv')) {
        let csvContent = await zip.file(fileName).async('string');
        console.log("CSV content:", csvContent);
      }
    }
  } catch (error) {
    console.error("Error fetching or extracting the dataset:", error);
  }
}

// Function to fetch, convert CSV to JSON, and store in the global variable
async function fetchAndConvertCSVToJSON() {
  const datasetUrl = "https://www.kaggle.com/api/v1/datasets/download/waqi786/remote-work-and-mental-health";

  try {
    // Step 1: Fetch the ZIP file
    let response = await fetch(datasetUrl);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

    let zipData = await response.arrayBuffer();

    // Step 2: Extract the ZIP using JSZip
    let zip = await JSZip.loadAsync(zipData);
    console.log("Files in the ZIP:", Object.keys(zip.files));

    // Step 3: Locate the CSV file
    let csvFileName = Object.keys(zip.files).find(file => file.endsWith('.csv'));
    let csvContent = await zip.file(csvFileName).async('string');
    console.log("CSV content:", csvContent);

    // Step 4: Convert CSV to JSON using PapaParse and store in the global variable
    globalJsonData = Papa.parse(csvContent, { header: true }).data;
    console.log("JSON Data:", globalJsonData);
    
    gender(globalJsonData);
  } catch (error) {
    console.error("Error fetching or extracting the dataset:", error);
  }
}

// Function to process gender distribution and display a pie chart
function gender(data) {
  let genderCounts = {};
  data.forEach(row => {
    let gender = row["Gender"];
    if (gender) {
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    }
  });

  let labels = Object.keys(genderCounts);
  let values = Object.values(genderCounts);

  console.log("Gender Distribution:", genderCounts);

  let chartData = [
    {
      type: "pie",
      labels: labels,
      values: values,
      textinfo: "label+percent",
      insidetextorientation: "radial"
    }
  ];

  let layout = {
    title: "Gender Distribution",
    height: 400,
    width: 600
  };

  Plotly.newPlot("pie-chart", chartData, layout);
}

// Blank function to use the global variable in another feature
function nextFeature() {
  // Access globalJsonData here
  console.log("Next feature using globalJsonData:", globalJsonData);
}

// Call the functions to fetch data and initiate processing
fetchAndExtractDataset();
fetchAndConvertCSVToJSON();
