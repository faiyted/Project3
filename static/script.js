// Fetch and process the MongoDB data
d3.json('/mongo_data')
  .then(mongoData => {
    // Map MongoDB data to include all fields you might need
    const data = mongoData.map(d => ({
      Productivity_Change: d.Productivity_Change || 'None',
      Industry: d.Industry || 'None',
      Physical_Activity: d.Physical_Activity || 'None',
      Access_to_Mental_Health_Resources: d.Access_to_Mental_Health_Resources || 'None',
      Job_Role: d.Job_Role || 'None',
      Hours_Worked_Per_Week: d.Hours_Worked_Per_Week || 'None',
      Work_Location: d.Work_Location || 'None',
      Employee_ID: d.Employee_ID || 'None',
      Number_of_Virtual_Meetings: d.Number_of_Virtual_Meetings || 'None',
      Stress_Level: d.Stress_Level || 'None',
      Mental_Health_Condition: d.Mental_Health_Condition || 'None',
      _id: d._id || 'None',
      Sleep_Quality: parseInt(d.Sleep_Quality, 10) || 'None',
      Company_Support_for_Remote_Work: d.Company_Support_for_Remote_Work || 'None',
      Work_Life_Balance_Rating: d.Work_Life_Balance_Rating || 'None',
      Social_Isolation_Rating: d.Social_Isolation_Rating || 'None',
      Region: d.Region || 'None',
      Gender: d.Gender || 'None',
      Satisfaction_with_Remote_Work: d.Satisfaction_with_Remote_Work || 'None',
      Age: d.Age || 'None',
      Years_of_Experience: d.Years_of_Experience || 'None',
      Value: d.Value || 1  // Replace `Value` with the appropriate field if needed
    }));

    console.log("MongoDB Data:", data);
    populateFilters(data);  // Populate the dropdown filters
    renderCircularBarChart(data);  // Initial circular chart rendering
    renderBarChart(data);  // Initial bar chart rendering
    renderStackedBarChartForPhysicalActivity(data);
    mentalPhy(data);

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


// ALL OF SUSAN'S GRAPH
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

// BEGINNING OF XIAN
function renderStackedBarChartForPhysicalActivity(data) {
  // Define the mapping for Sleep_Quality
  const sleepQualityLabels = {
    0: 'Poor',
    1: 'Average',
    2: 'Good'
  };



  // BEGINNING OF XIAN'S CODE
  // Group data by 'Physical_Activity'
  const groupedData = d3.group(data, d => d.Physical_Activity);
  console.log("Grouped Data by Physical Activity:", groupedData);

  // Get the unique categories for Physical Activity
  const physicalActivityLevels = Array.from(groupedData.keys());
  console.log("Physical Activity Levels:", physicalActivityLevels);

  // Initialize arrays to hold the counts for each sleep quality level
  let poorCounts = [];
  let averageCounts = [];
  let goodCounts = [];

  // Iterate over each physical activity level and count the sleep quality levels
  physicalActivityLevels.forEach(activityLevel => {
    const categoryData = groupedData.get(activityLevel) || [];
    
    let poorCount = 0;
    let averageCount = 0;
    let goodCount = 0;

    // Count the number of each sleep quality level within the physical activity category
    categoryData.forEach(d => {
      const sleepQuality = parseInt(d.Sleep_Quality, 10);  // Ensure Sleep_Quality is an integer
      if (d.Sleep_Quality === '0' || d.Sleep_Quality === 'None') {
        poorCount++;
      } else if (sleepQuality === 1) {
        averageCount++;
      } else if (sleepQuality === 2) {
        goodCount++;
      }
    });

    console.log(`Activity Level: ${activityLevel} - Poor: ${poorCount}, Average: ${averageCount}, Good: ${goodCount}`);
    
    poorCounts.push(poorCount);
    averageCounts.push(averageCount);
    goodCounts.push(goodCount);
  });

  console.log("Poor Counts:", poorCounts);
  console.log("Average Counts:", averageCounts);
  console.log("Good Counts:", goodCounts);

  // Prepare the traces for the stacked bar chart
  const trace1 = {
    x: physicalActivityLevels,
    y: poorCounts,
    name: sleepQualityLabels[0],
    type: 'bar'
  };

  const trace2 = {
    x: physicalActivityLevels,
    y: averageCounts,
    name: sleepQualityLabels[1],
    type: 'bar'
  };

  const trace3 = {
    x: physicalActivityLevels,
    y: goodCounts,
    name: sleepQualityLabels[2],
    type: 'bar'
  };

  // Combine the traces
  const traces = [trace1, trace2, trace3];

  // Define the layout for the stacked bar chart
  const layout = {
    title: 'Physical Activity vs Sleep Quality',
    barmode: 'stack',
    xaxis: { title: 'Physical Activity' },
    yaxis: { title: 'Number of People' }
  };

  // Render the chart using Plotly
  Plotly.newPlot('stacked-bar-chart', traces, layout);
}

// BEGINNING OF NEW CODE: Function to create Physical Activity vs Mental Health Condition chart
function mentalPhy(data) {
  // Group data by 'Physical_Activity'
  const groupedData = d3.group(data, d => d.Physical_Activity);
  console.log("Grouped Data by Physical Activity:", groupedData);

  // Get the unique categories for Physical Activity (e.g., Sedentary, Light, Moderate, etc.)
  const physicalActivityLevels = Array.from(groupedData.keys());
  console.log("Physical Activity Levels:", physicalActivityLevels);

  // Initialize arrays to hold the counts for each mental health condition
  let anxietyCounts = [];
  let depressionCounts = [];
  let burnoutCounts = [];
  let noneCounts = [];

  // Iterate over each physical activity level and count the mental health conditions
  physicalActivityLevels.forEach(activityLevel => {
    const categoryData = groupedData.get(activityLevel) || [];

    let anxietyCount = 0;
    let depressionCount = 0;
    let burnoutCount = 0;
    let noneCount = 0;

    // Count the number of each mental health condition within the physical activity category
    categoryData.forEach(d => {
      const mentalHealthCondition = d.Mental_Health_Condition;

      if (mentalHealthCondition === 'Anxiety') {
        anxietyCount++;
      } else if (mentalHealthCondition === 'Depression') {
        depressionCount++;
      } else if (mentalHealthCondition === 'Burnout') {
        burnoutCount++;
      } else if (mentalHealthCondition === 'None') {
        noneCount++;
      }
    });

    console.log(`Activity Level: ${activityLevel} - Anxiety: ${anxietyCount}, Depression: ${depressionCount}, Burnout: ${burnoutCount}, None: ${noneCount}`);
    
    anxietyCounts.push(anxietyCount);
    depressionCounts.push(depressionCount);
    burnoutCounts.push(burnoutCount);
    noneCounts.push(noneCount);
  });

  console.log("Anxiety Counts:", anxietyCounts);
  console.log("Depression Counts:", depressionCounts);
  console.log("Burnout Counts:", burnoutCounts);
  console.log("None Counts:", noneCounts);

  // Prepare the traces for the stacked bar chart
  const traceAnxiety = {
    x: physicalActivityLevels,
    y: anxietyCounts,
    name: 'Anxiety',
    type: 'bar',
    marker: { color: '#ff6f61' }  // Color for Anxiety
  };

  const traceDepression = {
    x: physicalActivityLevels,
    y: depressionCounts,
    name: 'Depression',
    type: 'bar',
    marker: { color: '#6a5acd' }  // Color for Depression
  };

  const traceBurnout = {
    x: physicalActivityLevels,
    y: burnoutCounts,
    name: 'Burnout',
    type: 'bar',
    marker: { color: '#ffa500' }  // Color for Burnout
  };

  const traceNone = {
    x: physicalActivityLevels,
    y: noneCounts,
    name: 'None',
    type: 'bar',
    marker: { color: '#5cb85c' }  // Color for None
  };

  // Combine the traces
  const traces = [traceAnxiety, traceDepression, traceBurnout, traceNone];

  // Define the layout for the stacked bar chart
  const layout = {
    title: 'Physical Activity vs Mental Health Condition',
    barmode: 'stack',
    xaxis: { title: 'Physical Activity' },
    yaxis: { title: 'Number of People' }
  };

  // Render the chart using Plotly
  Plotly.newPlot('xian-second', traces, layout);
}
// END OF NEW CODE: Function to create Physical Activity vs Mental Health Condition chart



