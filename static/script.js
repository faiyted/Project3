// ALL OF SUSAN'S GRAPH
// Fetch and process the MongoDB data
d3.json('/mongo_data')
  .then(mongoData => {
    // Assume the MongoDB structure is similar to your CSV data
    const data = mongoData.map(d => ({
      Industry: d.Industry || 'None',
      Mental_Health_Condition: d.Mental_Health_Condition || 'None',
      Work_Location: d.Work_Location || 'None',
      Region: d.Region || 'None',
      Satisfaction_with_Remote_Work: d.Satisfaction_with_Remote_Work || 'None',
      Value: d.Value || 1  // Replace `Value` with the appropriate field if needed
    }));

    console.log("MongoDB Data:", data);
    populateFilters(data);  // Populate the dropdown filters
    renderCircularBarChart(data);  // Initial circular chart rendering
    renderBarChart(data);  // Initial bar chart rendering

    // Add event listeners to each dropdown
    document.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', () => {
        const filteredData = filterData(data);  // Filter data based on the selections
        renderCircularBarChart(filteredData);  // Update the circular chart with filtered data
        renderBarChart(filteredData);  // Update the bar chart with filtered data
      });
    });
  })
  .catch(error => {
    console.error("Error fetching MongoDB data:", error);
  });


// Populate the dropdown filters dynamically based on the dataset
function populateFilters(data) {
  populateDropdown('regionFilter', [...new Set(data.map(d => d.Region))]);
  populateDropdown('workLocationFilter', [...new Set(data.map(d => d.Work_Location))]);
  populateDropdown('healthConditionFilter', [...new Set(data.map(d => d.Mental_Health_Condition))]);
}

// Helper to populate a dropdown by its ID
function populateDropdown(elementId, options) {
  const dropdown = document.getElementById(elementId);
  dropdown.innerHTML = '<option value="">All</option>';  // Add an "All" option
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    dropdown.appendChild(opt);
  });
}

// Filter the dataset based on the dropdown selections
function filterData(data) {
  const region = document.getElementById('regionFilter').value;
  const workLocation = document.getElementById('workLocationFilter').value;
  const healthCondition = document.getElementById('healthConditionFilter').value;

  return data.filter(d =>
    (region === '' || d.Region === region) &&
    (workLocation === '' || d.Work_Location === workLocation) &&
    (healthCondition === '' || d.Mental_Health_Condition === healthCondition)
  );
}

// Render the circular bar chart using Plotly
function renderCircularBarChart(data) {
  const industries = [...new Set(data.map(d => d.Industry))];  // Get unique industries
  const values = industries.map(ind => 
    data.filter(d => d.Industry === ind).reduce((sum, d) => sum + d.Value, 0)
  );

  const angles = industries.map((_, i) => (i * 360) / industries.length);
  const colors = industries.map((_, i) => `hsl(${i * 40}, 70%, 50%)`);

  const trace = {
    type: 'barpolar',
    r: values,
    theta: angles,
    text: industries.map((ind, i) => `<b>${ind}</b><br>Value: ${values[i]}`),
    marker: {
      color: colors,
    },
    hovertemplate: '%{text}<extra></extra>',
  };

  const layout = {
    polar: {
      radialaxis: { 
        visible: true, 
        range: [0, Math.max(...values)], 
        layer: 'above traces', // Ensures grid lines appear above bars
        showline: true, // Show the radial lines
        gridcolor: 'rgba(0, 0, 0, 0.5)', // Adjust the grid line color for contrast
        gridwidth: 1 // Adjust grid line thickness
      },
      angularaxis: {
        tickvals: angles,
        ticktext: industries,
        tickfont: { size: 14, weight: 'bold' }
      }
    },
    margin: { t: 20, l: 20, r: 20, b: 20 },
    showlegend: false
  };

  Plotly.newPlot('chart', [trace], layout);
}
// END OF SUSAN'S GRAPH



// ALL OF LAURA'S GRAPH
// Function to render the bar chart with Seahawks colors, percentages, capped y-axis at 35%, and custom labels
function renderBarChart(data) {
  // Prepare data for the bar chart
  const locations = [...new Set(data.map(d => d.Work_Location))];  // Get unique work locations

  // Map satisfaction levels to custom labels
  const satisfactionLabels = {
    'None': 'Unsatisfied',
    '1': 'Neutral',
    '2': 'Satisfied'
  };

  const satisfactionLevels = [...new Set(data.map(d => d.Satisfaction_with_Remote_Work))];  // Get unique satisfaction levels

  // Calculate total counts for each location
  const totalByLocation = locations.map(location => 
    data.filter(d => d.Work_Location === location).length
  );

  // Define Seahawks colors: Blue (#002244), Green (#69BE28), Grey (#A5ACAF)
  const seahawksColors = ['#002244', '#69BE28', '#A5ACAF'];

  const traceData = satisfactionLevels.map((satisfaction, index) => {
    return {
      x: locations,
      y: locations.map((location, i) => {
        const count = data.filter(d => d.Work_Location === location && d.Satisfaction_with_Remote_Work === satisfaction).length;
        const percentage = (count / totalByLocation[i]) * 100;
        return percentage;  // Use raw percentage for y values
      }),
      name: satisfactionLabels[satisfaction] || satisfaction,  // Use custom labels or fallback to the original value
      type: 'bar',
      marker: {
        color: seahawksColors[index % seahawksColors.length]  // Use Seahawks colors
      },
      text: locations.map((location, i) => {
        const count = data.filter(d => d.Work_Location === location && d.Satisfaction_with_Remote_Work === satisfaction).length;
        const percentage = (count / totalByLocation[i]) * 100;
        return `${percentage.toFixed(1)}%`;  // Display percentage at the top of each bar
      }),
      textposition: 'auto',  // Display percentage on top of each bar
      hoverinfo: 'none'  // Turn off hover effect
    };
  });

  const layout = {
    title: {
      text: 'Satisfaction with Remote Work by Work Location',
      font: {
        family: 'Arial, sans-serif',  // You can specify the font family if needed
        size: 18,  // Set the font size
        weight: 'bold',  // Make the text bold
      }
    },
    barmode: 'group',  // Group bars by location
    xaxis: {
      title: 'Work Location',
      tickangle: -45
    },
    yaxis: {
      title: 'Percentage (%)',
      range: [0, 40],  // Cap the y-axis maximum at 35%
    },
    margin: { t: 40, l: 40, r: 20, b: 80 },
    showlegend: true
  };
  

  // Render the bar chart
  Plotly.newPlot('barChart', traceData, layout);
}
// END OF LAURA'S GRAPH
