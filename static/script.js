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
    hoursMental(data);
    renderStackedBarChartForPhysicalActivity(data);
    mentalPhy(data);
    drawJobBarChart(data, 'Industry', 'Job_Role');
    drawBarChart(data);
    drawSunburstChart(data);
    mentalHealthResourcesChart(data);
    productivityChangeChart(data);
    stressLevelsBubbleChart(data);

    // Add event listeners to each dropdown
    document.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', () => {
        const filteredData = filterData(data);  // Filter data based on the selections
        renderCircularBarChart(filteredData);  // Update the circular chart with filtered data
        renderBarChart(filteredData);  // Update the bar chart with filtered data
        hoursMental(filteredData);
        renderStackedBarChartForPhysicalActivity(filteredData);
        mentalPhy(filteredData);
        drawJobBarChart(filteredData, 'Industry', 'Job_Role');
        drawBarChart(filteredData);
        drawSunburstChart(filteredData);
        mentalHealthResourcesChart(filteredData);
        productivityChangeChart(filteredData);
        stressLevelsBubbleChart(filteredData);
      });
    });
  })
  .catch(error => {
    console.error("Error fetching MongoDB data:", error);
  });

// *** SUSAN ***
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
// *** END OF SUSAN ***



// *** BEGINNING OF LAURA *** 
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


// Function to create a scatter chart with dots for Hours_Worked_Per_Week vs Mental_Health_Condition
function hoursMental(data) {
  // Define the categories for Mental Health Conditions with Seahawks colors
  const mentalHealthLabels = {
    'Anxiety': 'Anxiety',
    'Depression': 'Depression',
    'Burnout': 'Burnout',
    'None': 'None'
  };
  
  const seahawksColors = {
    'Anxiety': '#002244',  // Seahawks Blue
    'Depression': '#69BE28',  // Seahawks Green
    'Burnout': '#A5ACAF',  // Seahawks Grey
    'None': '#C0C0C0'  // Light Grey for None
  };

  // Group data by 'Hours_Worked_Per_Week'
  const groupedData = d3.group(data, d => d.Hours_Worked_Per_Week);
  console.log("Grouped Data by Hours Worked Per Week:", groupedData);

  // Get the unique categories for Hours Worked Per Week
  const hoursCategories = Array.from(groupedData.keys());
  console.log("Hours Worked Per Week Categories:", hoursCategories);

  // Initialize arrays to hold the counts for each mental health condition
  let anxietyCounts = [];
  let depressionCounts = [];
  let burnoutCounts = [];
  let noneCounts = [];

  // Iterate over each hours category and count the mental health conditions
  hoursCategories.forEach(hours => {
    const categoryData = groupedData.get(hours) || [];

    let anxietyCount = 0;
    let depressionCount = 0;
    let burnoutCount = 0;
    let noneCount = 0;

    // Count the number of each mental health condition within the hours category
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

    console.log(`Hours: ${hours} - Anxiety: ${anxietyCount}, Depression: ${depressionCount}, Burnout: ${burnoutCount}, None: ${noneCount}`);
    
    anxietyCounts.push(anxietyCount);
    depressionCounts.push(depressionCount);
    burnoutCounts.push(burnoutCount);
    noneCounts.push(noneCount);
  });

  console.log("Anxiety Counts:", anxietyCounts);
  console.log("Depression Counts:", depressionCounts);
  console.log("Burnout Counts:", burnoutCounts);
  console.log("None Counts:", noneCounts);

  // Prepare the traces for the scatter chart with dots
  const traceAnxiety = {
    x: hoursCategories,
    y: anxietyCounts,
    name: mentalHealthLabels['Anxiety'],
    type: 'scatter',
    mode: 'markers',
    marker: { color: seahawksColors['Anxiety'], size: 10 }
  };

  const traceDepression = {
    x: hoursCategories,
    y: depressionCounts,
    name: mentalHealthLabels['Depression'],
    type: 'scatter',
    mode: 'markers',
    marker: { color: seahawksColors['Depression'], size: 10 }
  };

  const traceBurnout = {
    x: hoursCategories,
    y: burnoutCounts,
    name: mentalHealthLabels['Burnout'],
    type: 'scatter',
    mode: 'markers',
    marker: { color: seahawksColors['Burnout'], size: 10 }
  };

  const traceNone = {
    x: hoursCategories,
    y: noneCounts,
    name: mentalHealthLabels['None'],
    type: 'scatter',
    mode: 'markers',
    marker: { color: seahawksColors['None'], size: 10 }
  };

  // Combine the traces
  const traces = [traceAnxiety, traceDepression, traceBurnout, traceNone];

  // Define the layout for the scatter chart with dots
  const layout = {
    title: 'Hours Worked Per Week vs Mental Health Condition',
    xaxis: { title: 'Hours Worked Per Week' },
    yaxis: { title: 'Number of People' },
    showlegend: true
  };

  // Render the chart using Plotly
  Plotly.newPlot('hours-mental-chart', traces, layout);
}

// *** END OF LAURA *** 



// *** BEGINNING OF XIAN ***
function renderStackedBarChartForPhysicalActivity(data) {
  // Define the mapping for Sleep_Quality
  const sleepQualityLabels = {
    0: 'Poor',
    1: 'Average',
    2: 'Good'
  };

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
// *** END OF XIAN ***


// *** BEGINNING OF YILANG ***
// Function to draw the job bar chart based on two x-axis fields
function drawJobBarChart(data, xAxisField1, xAxisField2) {
  const colors = {
    "HR": "#456d9f",
    "Sales": "#c08552",
    "Marketing": "#5c8c5b",
    "Software Engineer": "#984948",
    "Designer": "#8c75a7",
    "Project Manager": "#75564b",
    "Data Scientist": "#d89bb3"
  };

  const groupedData = d3.group(data, d => d[xAxisField1], d => d[xAxisField2]);

  const industryCategories = Array.from(groupedData.keys());
  const jobRoleCategories = Array.from(new Set(data.map(d => d[xAxisField2])));

  let traces = [];

  jobRoleCategories.forEach(jobRole => {
    let counts = [];

    industryCategories.forEach(industry => {
      const industryData = groupedData.get(industry) || new Map();
      const jobRoleData = industryData.get(jobRole) || [];
      counts.push(jobRoleData.length);  // Count the number of entries for this combination
    });

    traces.push({
      x: industryCategories,
      y: counts,
      name: jobRole,
      type: 'bar',
      marker: { color: colors[jobRole] || '#cccccc' }  // Assign color or default
    });
  });

  const layout = {
    title: `${xAxisField1.replace('_', ' ')} and ${xAxisField2.replace('_', ' ')} Distribution`,
    barmode: 'stack',
    xaxis: { title: xAxisField1.replace('_', ' ') },
    yaxis: { title: 'Number of People' },
  };

  Plotly.newPlot('job-bar-chart', traces, layout);
}

// Function to draw the gender distribution bar chart based on years of experience
function drawBarChart(data) {
  const groupedData = d3.group(data, d => d.Years_of_Experience);

  const yearsExperience = Array.from(groupedData.keys());

  let femaleCounts = [];
  let maleCounts = [];
  let nonBinaryCounts = [];
  let preferNotToSayCounts = [];

  yearsExperience.forEach(year => {
    const yearData = groupedData.get(year) || [];

    let femaleCount = 0;
    let maleCount = 0;
    let nonBinaryCount = 0;
    let preferNotToSayCount = 0;

    yearData.forEach(d => {
      switch (d.Gender) {
        case 'Female':
          femaleCount++;
          break;
        case 'Male':
          maleCount++;
          break;
        case 'Non-binary':
          nonBinaryCount++;
          break;
        case 'Prefer not to say':
          preferNotToSayCount++;
          break;
      }
    });

    femaleCounts.push(femaleCount);
    maleCounts.push(maleCount);
    nonBinaryCounts.push(nonBinaryCount);
    preferNotToSayCounts.push(preferNotToSayCount);
  });

  const femaleTrace = {
    x: yearsExperience,
    y: femaleCounts,
    name: 'Female',
    type: 'bar',
    marker: { color: '#1f77b4' }
  };

  const maleTrace = {
    x: yearsExperience,
    y: maleCounts,
    name: 'Male',
    type: 'bar',
    marker: { color: '#ff7f0e' }
  };

  const nonBinaryTrace = {
    x: yearsExperience,
    y: nonBinaryCounts,
    name: 'Non-binary',
    type: 'bar',
    marker: { color: '#2ca02c' }
  };

  const preferNotToSayTrace = {
    x: yearsExperience,
    y: preferNotToSayCounts,
    name: 'Prefer not to say',
    type: 'bar',
    marker: { color: '#d62728' }
  };

  const layout = {
    title: 'Years of Experience vs Gender Distribution',
    xaxis: { title: 'Years of Experience' },
    yaxis: { title: 'Count of Employees' },
    barmode: 'group'
  };

  Plotly.newPlot('bar-chart', [femaleTrace, maleTrace, nonBinaryTrace, preferNotToSayTrace], layout);
}


// Function to draw the Sunburst chart
function drawSunburstChart(data) {
  let labels = [];
  let parents = [];
  let values = [];

  const experienceGroups = d3.group(data, d => d.Years_of_Experience);

  experienceGroups.forEach((groupData, experience) => {
    const experienceLabel = `${experience} Years of Experience`;
    labels.push(experienceLabel);
    parents.push('');
    values.push(groupData.length);

    const hoursGroups = d3.group(groupData, d => d.Hours_Worked_Per_Week);

    hoursGroups.forEach((subGroupData, hours) => {
      const hoursLabel = `${hours} Hours/Week (${experience} Years)`;
      labels.push(hoursLabel);
      parents.push(experienceLabel);
      values.push(subGroupData.length);

      const balanceGroups = d3.group(subGroupData, d => d.Work_Life_Balance_Rating);

      balanceGroups.forEach((finalGroupData, balance) => {
        const balanceLabel = `Work-Life Balance: ${balance} (${hours} Hours/${experience} Years)`;
        labels.push(balanceLabel);
        parents.push(hoursLabel);
        values.push(finalGroupData.length);
      });
    });
  });

  const trace = {
    type: 'sunburst',
    labels: labels,
    parents: parents,
    values: values,
    leaf: { opacity: 0.6 },
    marker: { line: { width: 2 } },
    branchvalues: 'total'
  };

  const layout = {
    title: 'Sunburst Chart: Experience, Hours Worked, and Work-Life Balance',
    width: 1000,
    height: 1000
  };

  Plotly.newPlot('sunburst-chart', [trace], layout);
}
// *** END OF YILING ***


// *** LOGAN'S CHARTS ***
// MENTAL HEALTH RESOURCES AND PHYSICAL ACTIVITY BY MENTAL HEALTH CONDITION
function mentalHealthResourcesChart(data) {
  // Process data for the chart
  const conditions = [...new Set(data.map(d => d.Mental_Health_Condition))]; // Unique mental health conditions
  const physicalActivities = [...new Set(data.map(d => d.Physical_Activity))]; // Unique physical activities
  const accessLevels = [...new Set(data.map(d => d.Access_to_Mental_Health_Resources))]; // Unique access levels
  
  const chartData = [];

  // Prepare the data for grouped bar chart
  physicalActivities.forEach(activity => {
      accessLevels.forEach(access => {
          const yData = conditions.map(condition => {
              // Filter data for each condition, activity, and access combination
              const filteredData = data.filter(d =>
                  d.Mental_Health_Condition === condition &&
                  d.Physical_Activity === activity &&
                  d.Access_to_Mental_Health_Resources === access
              );
              return filteredData.length; // Count the number of matching records
          });

          // Modify the access level and activity label in the legend
          const accessLabel = access === 'Yes' ? 'Yes Access' : 'No Access';
          const activityLabel = activity === 'No Activity' ? 'No Activity' : activity === 'Weekly' ? 'Weekly Activity' : 'Daily Activity';

          // Push data for each activity and access level combination
          chartData.push({
              x: conditions, // Mental health conditions as x-axis
              y: yData, // Y-axis data (count of records)
              name: `${accessLabel}, ${activityLabel}`, // Name to appear in the legend
              type: 'bar', // Bar chart
          });
      });
  });

  const layout = {
      title: 'Access to Mental Health Resources and Physical Activity by Mental Health Condition',
      barmode: 'group', // Grouped bars
      xaxis: { title: 'Mental Health Condition' }, // X-axis title
      yaxis: { title: 'Count of Employees' }, // Y-axis title
      showlegend: true, // Display legend
  };

  // Render the chart using Plotly
  Plotly.newPlot('mental-health-chart', chartData, layout);
}

// PRODUCTIVITY CHANGE BY WORK LOCATION
function productivityChangeChart(data) {
  const workLocations = ['Remote', 'Hybrid', 'Onsite'];
  const changeTypes = ['Increase', 'Decrease', 'No Change'];
  const colors = ['#69BE28', '#FF4500', '#4682B4'];

  const traces = changeTypes.map((change, i) => {
    return {
      x: workLocations,
      y: workLocations.map(location => {
        return data.filter(d => d.Work_Location === location && d.Productivity_Change === change).length;
      }),
      name: change,
      type: 'bar',
      marker: { color: colors[i] },
      text: workLocations.map(location => {
        const count = data.filter(d => d.Work_Location === location && d.Productivity_Change === change).length;
        const total = data.filter(d => d.Work_Location === location).length;
        const percentage = (count / total) * 100;
        return `${count} (${percentage.toFixed(1)}%)`;
      }),
      textposition: 'auto' // Display text on top of bars
    };
  });

  const layout = {
    title: 'Productivity Change by Work Location (With Counts and Percentages)',
    barmode: 'stack',
    xaxis: { title: 'Work Location' },
    yaxis: { title: 'Number of Employees' },
  };

  Plotly.newPlot('productivity-change-chart', traces, layout);
}

// BUBBLE CHART

// *** Populate the dropdown filters dynamically based on the dataset ***
function populateFilters(data) {
  populateDropdown('stressLevelFilter', [...new Set(data.map(d => d.Stress_Level))]);
  populateDropdown('hoursWorkedFilter', [...new Set(data.map(d => d.Hours_Worked_Per_Week))]);
  populateDropdown('virtualMeetingsFilter', [...new Set(data.map(d => d.Number_of_Virtual_Meetings))]);
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
  const stressLevel = document.getElementById('stressLevelFilter').value;
  const hoursWorked = document.getElementById('hoursWorkedFilter').value;
  const virtualMeetings = document.getElementById('virtualMeetingsFilter').value;

  return data.filter(d =>
    (stressLevel === '' || d.Stress_Level === stressLevel) &&
    (hoursWorked === '' || d.Hours_Worked_Per_Week == hoursWorked) &&
    (virtualMeetings === '' || d.Number_of_Virtual_Meetings == virtualMeetings)
  );
}

function stressLevelsBubbleChart(data) {
  // Mapping stress levels to numerical values
  const stressLevelsMap = {
      'Low': 5,       // Low stress
      'Medium': 10,   // Medium stress
      'High': 15      // High stress
  };

  // Process data for the chart
  const hoursWorked = data.map(d => d.Hours_Worked_Per_Week);
  const virtualMeetings = data.map(d => d.Number_of_Virtual_Meetings);
  const stressLevels = data.map(d => stressLevelsMap[d.Stress_Level]);

  // Create text labels that combine Hours Worked, Virtual Meetings, and Stress Levels
  const bubbleText = data.map((d, i) => 
    `Hours Worked: ${hoursWorked[i]}<br>Virtual Meetings: ${virtualMeetings[i]}<br>Stress Level: ${stressLevels[i]}`
  );

  // Calculate sizes for bubbles (relative to stress level)
  const bubbleSizes = stressLevels.map(s => s * 10);

  const trace = {
      x: hoursWorked,
      y: virtualMeetings,
      text: bubbleText,  // Updated text to include hours worked, virtual meetings, and stress levels
      mode: 'markers',
      marker: {
          size: bubbleSizes,
          color: stressLevels,
          colorscale: 'Viridis',
          showscale: true
      },
      hovertemplate: '%{text}<extra></extra>',  // Ensure hover text shows all the info
  };

  const layout = {
      title: 'Bubble Chart of Stress Levels by Hours Worked and Virtual Meetings',
      xaxis: { title: 'Hours Worked' },
      yaxis: { title: 'Virtual Meetings' },
      showlegend: false,
  };

  Plotly.newPlot('stress-levels-bubble-chart', [trace], layout);
}
