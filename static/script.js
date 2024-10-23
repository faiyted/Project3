// Fetch and process the MongoDB data
d3.json('/mongo_data')
  .then(mongoData => {
    // Map MongoDB data to include all fields with proper integer and string handling
    const data = mongoData.map(d => ({
      Productivity_Change: d.Productivity_Change || 'None',  // String
      Industry: d.Industry || 'None',  // String
      Physical_Activity: d.Physical_Activity || 'None',  // String
      Access_to_Mental_Health_Resources: d.Access_to_Mental_Health_Resources || 'None',  // String
      Job_Role: d.Job_Role || 'None',  // String
      Hours_Worked_Per_Week: parseInt(d.Hours_Worked_Per_Week, 10) || 0,  // Integer
      Work_Location: d.Work_Location || 'None',  // String
      Employee_ID: d.Employee_ID || 'None',  // String
      Number_of_Virtual_Meetings: parseInt(d.Number_of_Virtual_Meetings, 10) || 0,  // Integer
      Stress_Level: parseInt(d.Stress_Level, 10) || 0,  // Integer
      Mental_Health_Condition: d.Mental_Health_Condition || 'None',  // String
      _id: d._id || 'None',  // String
      Sleep_Quality: parseInt(d.Sleep_Quality, 10) || 0,  // Integer
      Company_Support_for_Remote_Work: d.Company_Support_for_Remote_Work || 'None',  // String
      Work_Life_Balance_Rating: parseInt(d.Work_Life_Balance_Rating, 10) || 0,  // Integer
      Social_Isolation_Rating: parseInt(d.Social_Isolation_Rating, 10) || 0,  // Integer
      Region: d.Region || 'None',  // String
      Gender: d.Gender || 'None',  // String
      Satisfaction_with_Remote_Work: parseInt(d.Satisfaction_with_Remote_Work, 10) || 0,  // Integer
      Age: parseInt(d.Age, 10) || 0,  // Integer
      Years_of_Experience: parseInt(d.Years_of_Experience, 10) || 0,  // Integer
      Value: d.Value || 1  // Default value, adjust as necessary
    }));

    console.log("MongoDB Data:", data);
    populateFilters(data);  // Populate the dropdown filters
    renderCircularBarChart(data);  // Initial circular chart rendering
    renderBarChart(data);  // Initial bar chart rendering
    hoursMental(data);
    renderStackedBarChartForPhysicalActivity(data);
    mentalPhy(data);
    drawJobBarChart(data, 'Industry', 'Job_Role');
    // drawBarChart(data);
    // drawSunburstChart(data);
    drawLineChartByAgeAndGender(data);
    drawStressBubbleChart(data)


    // Add event listeners to each dropdown
    document.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', () => {
        const filteredData = filterData(data);  // Filter data based on the selections
        renderCircularBarChart(filteredData);  // Update the circular chart with filtered data
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
    '0': 'Unsatisfied',
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

  // Create trace data for the bar chart
  const traceData = satisfactionLevels.map((satisfaction, index) => {
    return {
      x: locations,
      y: locations.map((location, i) => {
        const count = data.filter(d => d.Work_Location === location && d.Satisfaction_with_Remote_Work === satisfaction).length;
        const percentage = (count / totalByLocation[i]) * 100;
        return percentage;  // Use percentage for y values
      }),
      name: satisfactionLabels[satisfaction] || satisfaction,  // Use custom labels or fallback to the original value
      type: 'bar',
      marker: {
        color: seahawksColors[index % seahawksColors.length]  // Use Seahawks colors
      },
      text: locations.map((location, i) => {
        const count = data.filter(d => d.Work_Location === location && d.Satisfaction_with_Remote_Work === satisfaction).length;
        const percentage = (count / totalByLocation[i]) * 100;
        return `${count} employees (${percentage.toFixed(1)}%)`;  // Display count and percentage on hover
      }),
      textposition: 'auto',  // Display percentage on top of each bar
      hoverinfo: 'text'  // Enable hover to show counts and percentages
    };
  });

  const layout = {
    title: {
      text: 'Satisfaction with Remote Work by Work Location',
      font: {
        family: 'Arial, sans-serif',  // Font family
        size: 18,  // Font size
        weight: 'bold',  // Bold text
      }
    },
    barmode: 'group',  // Group bars by location
    xaxis: {
      title: 'Work Location',
      tickangle: -45  // Rotate x-axis labels
    },
    yaxis: {
      title: 'Percentage (%)',
      range: [0, 40],  // Cap y-axis maximum at 40%
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
    'Anxiety': '#1B3A68',  // Deep Navy Blue  
    'Depression': '#87D37C',  // Vibrant Green  
    'Burnout': '#984948',  // Steel Grey with a slight blue tone  
    'None': '#E0E0E0'  // Softer Light Grey for better differentiation
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
      if (d.Sleep_Quality === 0) {
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
// function drawBarChart(data) {
//   const groupedData = d3.group(data, d => d.Years_of_Experience);

//   const yearsExperience = Array.from(groupedData.keys());

//   let femaleCounts = [];
//   let maleCounts = [];
//   let nonBinaryCounts = [];
//   let preferNotToSayCounts = [];

//   yearsExperience.forEach(year => {
//     const yearData = groupedData.get(year) || [];

//     let femaleCount = 0;
//     let maleCount = 0;
//     let nonBinaryCount = 0;
//     let preferNotToSayCount = 0;

//     yearData.forEach(d => {
//       switch (d.Gender) {
//         case 'Female':
//           femaleCount++;
//           break;
//         case 'Male':
//           maleCount++;
//           break;
//         case 'Non-binary':
//           nonBinaryCount++;
//           break;
//         case 'Prefer not to say':
//           preferNotToSayCount++;
//           break;
//       }
//     });

//     femaleCounts.push(femaleCount);
//     maleCounts.push(maleCount);
//     nonBinaryCounts.push(nonBinaryCount);
//     preferNotToSayCounts.push(preferNotToSayCount);
//   });

//   const femaleTrace = {
//     x: yearsExperience,
//     y: femaleCounts,
//     name: 'Female',
//     type: 'bar',
//     marker: { color: '#1f77b4' }
//   };

//   const maleTrace = {
//     x: yearsExperience,
//     y: maleCounts,
//     name: 'Male',
//     type: 'bar',
//     marker: { color: '#ff7f0e' }
//   };

//   const nonBinaryTrace = {
//     x: yearsExperience,
//     y: nonBinaryCounts,
//     name: 'Non-binary',
//     type: 'bar',
//     marker: { color: '#2ca02c' }
//   };

//   const preferNotToSayTrace = {
//     x: yearsExperience,
//     y: preferNotToSayCounts,
//     name: 'Prefer not to say',
//     type: 'bar',
//     marker: { color: '#d62728' }
//   };

//   const layout = {
//     title: 'Years of Experience vs Gender Distribution',
//     xaxis: { title: 'Years of Experience' },
//     yaxis: { title: 'Count of Employees' },
//     barmode: 'group'
//   };

//   Plotly.newPlot('bar-chart', [femaleTrace, maleTrace, nonBinaryTrace, preferNotToSayTrace], layout);
// }


// Function to draw the Sunburst chart
// function drawSunburstChart(data) {
//   let labels = [];
//   let parents = [];
//   let values = [];

//   const experienceGroups = d3.group(data, d => d.Years_of_Experience);

//   experienceGroups.forEach((groupData, experience) => {
//     const experienceLabel = `${experience} Years of Experience`;
//     labels.push(experienceLabel);
//     parents.push('');
//     values.push(groupData.length);

//     const hoursGroups = d3.group(groupData, d => d.Hours_Worked_Per_Week);

//     hoursGroups.forEach((subGroupData, hours) => {
//       const hoursLabel = `${hours} Hours/Week (${experience} Years)`;
//       labels.push(hoursLabel);
//       parents.push(experienceLabel);
//       values.push(subGroupData.length);

//       const balanceGroups = d3.group(subGroupData, d => d.Work_Life_Balance_Rating);

//       balanceGroups.forEach((finalGroupData, balance) => {
//         const balanceLabel = `Work-Life Balance: ${balance} (${hours} Hours/${experience} Years)`;
//         labels.push(balanceLabel);
//         parents.push(hoursLabel);
//         values.push(finalGroupData.length);
//       });
//     });
//   });

//   const trace = {
//     type: 'sunburst',
//     labels: labels,
//     parents: parents,
//     values: values,
//     leaf: { opacity: 0.6 },
//     marker: { line: { width: 2 } },
//     branchvalues: 'total'
//   };

//   const layout = {
//     title: 'Sunburst Chart: Experience, Hours Worked, and Work-Life Balance',
//     width: 1000,
//     height: 1000
//   };

//   Plotly.newPlot('sunburst-chart', [trace], layout);
// }
// *** END OF YILING ***
function drawLineChartByAgeAndGender(data) {
    // Function to categorize age into ranges
    function categorizeAge(age) {
      if (age <= 25) return '18-25';
      if (age > 25 && age <= 35) return '26-35';
      if (age > 35 && age <= 45) return '36-45';
      if (age > 45 && age <= 55) return '46-55';
      if (age > 55) return '56+';
      return null;
    }
  
    // Group the data by Age Range and Gender
    const groupedData = d3.group(data, d => categorizeAge(d.Age), d => d.Gender);
  
    // Define age ranges and prepare traces for each gender
    const ageRanges = ['18-25', '26-35', '36-45', '46-55', '56+'];
    const genders = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];
  
    const genderTraces = {};
  
    // Initialize arrays for each gender
    genders.forEach(gender => {
      genderTraces[gender] = {
        x: ageRanges,
        y: Array(ageRanges.length).fill(0),
        name: gender,
        mode: 'lines+markers',
        type: 'scatter',
        marker: { size: 8 },
        line: { width: 2 }
      };
    });
  
    // Populate the y-values (average years of experience)
    ageRanges.forEach((ageRange, i) => {
      genders.forEach(gender => {
        const ageGenderGroup = groupedData.get(ageRange)?.get(gender) || [];
    
        if (ageGenderGroup.length > 0) {
          const totalHoursWorked = ageGenderGroup.reduce((sum, d) => sum + parseFloat(d.Hours_Worked_Per_Week || 0), 0);
          const averageHoursWorked = totalHoursWorked / ageGenderGroup.length;
    
          genderTraces[gender].y[i] = averageHoursWorked;
        }
      });
    });
  
    // Convert traces object to an array of traces
    const traces = Object.values(genderTraces);
  
    // Layout configuration for Plotly
    const layout = {
      title: 'Average Hours Worked per Week by Age Range and Gender',
      xaxis: { title: 'Age Range' },
      yaxis: { title: 'Average Hours Worked' },
      grid: true
    };
  
    // Plot the line chart
    Plotly.newPlot('line-chart', traces, layout);
  }

  function drawStressBubbleChart(data) {
    // Extract data for plot
    const virtualMeetings = data.map(d => parseInt(d.Number_of_Virtual_Meetings, 10) || 0);  // Ensure valid numbers
    const hoursWorked = data.map(d => parseInt(d.Hours_Worked_Per_Week, 10) || 0);  // Ensure valid numbers
    const stressLevels = data.map(d => parseInt(d.Stress_Level, 10));  // Directly map 0, 1, 2
  
    const stressLabels = ['Low', 'Medium', 'High'];  // Direct labels for hover text
  
    // Define the trace for the bubble chart
    const trace = {
      x: virtualMeetings,
      y: hoursWorked,
      mode: 'markers',
      marker: {
        size: stressLevels.map(level => (level + 1) * 15),  // Scale marker size (avoid 0 size)
        color: stressLevels,  // Color by stress level
        colorscale: 'YlOrRd',  // Color scale from yellow to red
        showscale: true,  // Display the color scale
        colorbar: {
          title: 'Stress Levels',
          tickvals: [0, 1, 2],  // Ticks for Low, Medium, High
          ticktext: ['Low', 'Medium', 'High']
        }
      },
      text: stressLevels.map(level => stressLabels[level]),  // Hover text with stress labels
      hovertemplate: 
        'Virtual Meetings: %{x}<br>' + 
        'Hours Worked: %{y}<br>' + 
        'Stress Level: %{text}<extra></extra>'  // Custom hover info
    };
  
    // Define the layout for the bubble chart
    const layout = {
      title: 'Stress Levels by Hours Worked and Virtual Meetings',
      xaxis: { title: 'Number of Virtual Meetings' },
      yaxis: { title: 'Hours Worked per Week' },
      hovermode: 'closest'  // Enable hover interaction
    };
  
    // Render the plot
    Plotly.newPlot('bubble-chart', [trace], layout);
  }
