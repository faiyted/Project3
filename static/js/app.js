let globalJsonData = []; // Declare a global variable to hold JSON data

async function fetchAndConvertData() {
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
        globalJsonData = Papa.parse(csvContent, { header: true }).data; // Store CSV data in JSON format
        console.log("Parsed CSV data:", globalJsonData);
      }
    }

    // Call the visualization functions with the loaded data
    gender(globalJsonData);
    workSatisfactionBarChart(globalJsonData);
    
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



function workSatisfactionBarChart(data) {
  // Initialize objects to store counts and totals
  let locationSatisfactionCounts = {};
  let totalByLocation = {};

  // Aggregate data to get counts for each Work_Location and Satisfaction_with_Remote_Work level
  data.forEach(row => {
    const location = row["Work_Location"];
    const satisfaction = row["Satisfaction_with_Remote_Work"];

    if (location && satisfaction) {  // Filter out rows with undefined or empty satisfaction levels
      // Initialize nested object if it doesn't exist
      if (!locationSatisfactionCounts[location]) {
        locationSatisfactionCounts[location] = {};
        totalByLocation[location] = 0;
      }

      // Increment the count for the specific satisfaction level
      locationSatisfactionCounts[location][satisfaction] = (locationSatisfactionCounts[location][satisfaction] || 0) + 1;

      // Increment the total count for this work location
      totalByLocation[location] += 1;
    }
  });

  // Prepare data for Plotly
  const workLocations = Object.keys(locationSatisfactionCounts);
  const satisfactionLevels = [...new Set(data.map(row => row["Satisfaction_with_Remote_Work"]))].filter(level => level);  // Filter out undefined or empty levels

  let traces = satisfactionLevels.map((level) => {
    let counts = workLocations.map(location => locationSatisfactionCounts[location][level] || 0);
    let percentages = counts.map((count, i) => (count / totalByLocation[workLocations[i]]) * 100);

    return {
      x: workLocations,
      y: percentages,
      name: level,
      type: 'bar',
      text: percentages.map(percentage => `${percentage.toFixed(1)}%`),
      textposition: 'auto',
      hovertemplate: `${level}: %{y:.1f}%<extra></extra>`,  // Custom hover text
    };
  });

  // Define layout
  let layout = {
    title: "Satisfaction with Remote Work by Work Location",
    xaxis: {
      title: "Work Location",
    },
    yaxis: {
      title: "Percentage (%)"
    },
    barmode: 'group',
    width: 1000,
    height: 600,
  };

  // Render plot
  Plotly.newPlot('bar-chart', traces, layout);
}




// Blank function to use the global variable in another feature
function nextFeature() {
  // Access globalJsonData here
  console.log("Next feature using globalJsonData:", globalJsonData);
}

// Call the function to fetch data and initiate processing
fetchAndConvertData();
