const colors = {
    "HR": "#456d9f",
    "Sales":"#c08552",
    "Marketing":"#5c8c5b",
    "Software Engineer": "#984948",
    "Designer":"#8c75a7",
    "Project Manager":"#75564b",
    "Data Scientist":"#d89bb3"
  }

  function drawChart(data, xAxisField1, xAxisField2) {
    const groupedData = d3.group(data, d => d[xAxisField1], d => d[xAxisField2]);

    const industryCategories = Array.from(groupedData.keys());
    const jobRoleCategories = Array.from(new Set(data.map(d => d[xAxisField2]))); // Unique Job Roles

    let traces = [];

    jobRoleCategories.forEach(jobRole => {
        let counts = [];

        industryCategories.forEach(industry => {
            const industryData = groupedData.get(industry) || new Map();
            const jobRoleData = industryData.get(jobRole) || [];
            counts.push(jobRoleData.length);  // Push count of each combination
        });

        traces.push({
            x: industryCategories,
            y: counts,
            name: jobRole,
            type: 'bar'
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

// const genderColors = {
//     'Female': '#1f77b4',
//     'Male': '#ff7f0e',
//     'Non-binary': '#2ca02c',
//     'Prefer not to say': '#d62728'
//   };

//   function drawLineChart(data) {
//     // Group the data by Age_Range and Gender
//     const groupedData = d3.group(data, d => d.Age_Range, d => d.Gender);

//     // Get distinct Age_Ranges
//     const ageRanges = ['18-25', '26-35', '36-45', '46-55', '56+'];

//     // Prepare traces for each gender
//     const traces = [];
    
//     for (const gender of Object.keys(genderColors)) {
//       const trace = {
//         x: ageRanges,
//         y: [],
//         name: gender,
//         mode: 'lines+markers',
//         line: { color: genderColors[gender] }
//       };

//       // Fill the y-axis values with the average years of experience for each age range
//       ageRanges.forEach(ageRange => {
//         const ageGroup = groupedData.get(ageRange) || new Map();
//         const genderData = ageGroup.get(gender) || [];

//         // Check if data exists for this combination
//         if (genderData.length > 0) {
//           const avgYearsOfExperience = d3.mean(genderData, d => d.Years_of_Experience);
//           trace.y.push(avgYearsOfExperience);
//         } else {
//           trace.y.push(null); // Handle missing data
//         }
//       });

//       traces.push(trace);
//     }

//     const layout = {
//       title: 'Average Years of Experience by Age Range and Gender',
//       xaxis: { title: 'Age Range' },
//       yaxis: { title: 'Average Years of Experience' },
//     };
 
//     Plotly.newPlot('line-chart', traces, layout);
//   }
// Function to categorize age into age ranges
function getAgeRange(age) {
    if (age >= 18 && age <= 25) return '18-25';
    if (age >= 26 && age <= 35) return '26-35';
    if (age >= 36 && age <= 45) return '36-45';
    if (age >= 46 && age <= 55) return '46-55';
    return '56+';
}

// Function to draw the bar chart
function drawBarChart(data) {
    // Preprocess the data
    const groupedData = d3.group(data, d => d.Years_of_Experience);
    
    // Collect the X-axis values (Years_of_Experience)
    const yearsExperience = Array.from(groupedData.keys());
    
    // Initialize arrays for gender-based counts
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
            const ageRange = getAgeRange(d.Age);
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
    
    // Define the traces for each gender as bar type
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

    // Plot the chart using Plotly
    const layout = {
        title: 'Years of Experience vs Gender Distribution',
        xaxis: { title: 'Years of Experience' },
        yaxis: { title: 'Count of Employees' },
        barmode: 'group' // Group the bars by years of experience
    };

    const traces = [femaleTrace, maleTrace, nonBinaryTrace, preferNotToSayTrace];

    Plotly.newPlot('bar-chart', traces, layout);
}

// // Function to categorize age into age ranges
// function getAgeRange(age) {
//     if (age >= 18 && age <= 25) return '18-25';
//     if (age >= 26 && age <= 35) return '26-35';
//     if (age >= 36 && age <= 45) return '36-45';
//     if (age >= 46 && age <= 55) return '46-55';
//     return '56+';
// }

// // Function to draw the line chart
// function drawLineChart(data) {
//     // Preprocess the data
//     const groupedData = d3.group(data, d => d.Years_of_Experience);
    
//     // Collect the X-axis values (Years_of_Experience)
//     const yearsExperience = Array.from(groupedData.keys());
    
//     // Initialize arrays for gender-based counts
//     let femaleCounts = [];
//     let maleCounts = [];
//     let nonBinaryCounts = [];
//     let preferNotToSayCounts = [];
    
//     yearsExperience.forEach(year => {
//         const yearData = groupedData.get(year) || [];
        
//         let femaleCount = 0;
//         let maleCount = 0;
//         let nonBinaryCount = 0;
//         let preferNotToSayCount = 0;
        
//         yearData.forEach(d => {
//             const ageRange = getAgeRange(d.Age);
//             switch (d.Gender) {
//                 case 'Female':
//                     femaleCount++;
//                     break;
//                 case 'Male':
//                     maleCount++;
//                     break;
//                 case 'Non-binary':
//                     nonBinaryCount++;
//                     break;
//                 case 'Prefer not to say':
//                     preferNotToSayCount++;
//                     break;
//             }
//         });
        
//         femaleCounts.push(femaleCount);
//         maleCounts.push(maleCount);
//         nonBinaryCounts.push(nonBinaryCount);
//         preferNotToSayCounts.push(preferNotToSayCount);
//     });
    
//     // Define the traces for each gender
//     const femaleTrace = {
//         x: yearsExperience,
//         y: femaleCounts,
//         name: 'Female',
//         mode: 'lines+markers',
//         line: { color: '#1f77b4' }
//     };

//     const maleTrace = {
//         x: yearsExperience,
//         y: maleCounts,
//         name: 'Male',
//         mode: 'lines+markers',
//         line: { color: '#ff7f0e' }
//     };

//     const nonBinaryTrace = {
//         x: yearsExperience,
//         y: nonBinaryCounts,
//         name: 'Non-binary',
//         mode: 'lines+markers',
//         line: { color: '#2ca02c' }
//     };

//     const preferNotToSayTrace = {
//         x: yearsExperience,
//         y: preferNotToSayCounts,
//         name: 'Prefer not to say',
//         mode: 'lines+markers',
//         line: { color: '#d62728' }
//     };

//     // Plot the chart using Plotly
//     const layout = {
//         title: 'Years of Experience vs Gender Distribution',
//         xaxis: { title: 'Years of Experience' },
//         yaxis: { title: 'Count of Employees' }
//     };

//     const traces = [femaleTrace, maleTrace, nonBinaryTrace, preferNotToSayTrace];

//     Plotly.newPlot('line-chart', traces, layout);
// }
function drawSunburstChart(data) {
    // Preprocess data to create hierarchical structure for Sunburst
    let labels = [];
    let parents = [];
    let values = [];
    
    // Group data by "Years of Experience"
    const experienceGroups = d3.group(data, d => d.Years_of_Experience);

    experienceGroups.forEach((groupData, experience) => {
        const experienceLabel = `${experience} Years of Experience`;
        labels.push(experienceLabel);
        parents.push('');
        values.push(groupData.length);

        // Group within experience by "Hours Worked Per Week"
        const hoursGroups = d3.group(groupData, d => d.Hours_Worked_Per_Week);

        hoursGroups.forEach((subGroupData, hours) => {
            const hoursLabel = `${hours} Hours/Week (${experience} Years)`;
            labels.push(hoursLabel);
            parents.push(experienceLabel);
            values.push(subGroupData.length);

            // Further group by "Work-Life Balance Rating"
            const balanceGroups = d3.group(subGroupData, d => d.Work_Life_Balance_Rating);

            balanceGroups.forEach((finalGroupData, balance) => {
                const balanceLabel = `Work-Life Balance: ${balance} (${hours} Hours/${experience} Years)`;
                labels.push(balanceLabel);
                parents.push(hoursLabel);
                values.push(finalGroupData.length);
            });
        });
    });

    // Data for Sunburst chart
    const trace = {
        type: 'sunburst',
        labels: labels,
        parents: parents,
        values: values,
        leaf: { opacity: 0.6 },
        marker: { line: { width: 2 } },
        branchvalues: 'total' // Ensure correct hierarchy visualization
    };

    // Layout for the chart
    const layout = {
        title: 'Sunburst Chart: Experience, Hours Worked, and Work-Life Balance',
        width: 600,
        height: 600
    };

    // Plot the Sunburst chart using Plotly
    Plotly.newPlot('sunburst-chart', [trace], layout);
}


// function drawScatterChart(data) {
//     // Prepare the data for the scatter chart
//     const xValues = data.map(d => d.Years_of_Experience);
//     const yValues = data.map(d => d.Hours_Worked_Per_Week);
//     const sizeValues = data.map(d => d.Work_Life_Balance_Rating * 10); // Scale size for visibility
//     const colors = data.map(d => {
//         switch (d.Work_Life_Balance_Rating) {
//             case 1:
//                 return 'red';
//             case 2:
//                 return 'orange';
//             case 3:
//                 return 'yellow';
//             case 4:
//                 return 'green';
//             case 5:
//                 return 'blue';
//             default:
//                 return 'gray';
//         }
//     });

//     // Create the trace for the scatter chart
//     const trace = {
//         x: xValues,
//         y: yValues,
//         mode: 'markers',
//         marker: {
//             size: sizeValues,
//             color: colors,
//             showscale: true,
//             colorscale: 'Portland'
//         },
//         text: data.map(d => `Work-Life Balance: ${d.Work_Life_Balance_Rating}`)
//     };

//     // Layout for the scatter chart
//     const layout = {
//         title: 'Years of Experience vs Hours Worked (with Work-Life Balance)',
//         xaxis: { title: 'Years of Experience' },
//         yaxis: { title: 'Hours Worked Per Week' },
//         showlegend: false
//     };

//     // Plot the chart using Plotly
//     Plotly.newPlot('scatter-chart', [trace], layout);
// }

// Load the JSON and draw the chart
d3.json('../cleanDataset.json')
    .then(data => {
        drawChart(data, 'Industry', 'Job_Role');
        drawBarChart(data); 
        drawSunburstChart(data);

        // const selectBox1 = document.getElementById('xAxisSelect1');
        // const selectBox2 = document.getElementById('xAxisSelect2');
        
        // selectBox1.addEventListener('change', () => {
        //     drawChart(data, selectBox1.value, selectBox2.value);
        // });

        // selectBox2.addEventListener('change', () => {
        //     drawChart(data, selectBox1.value, selectBox2.value);
        // });
    })
    .catch(error => {
        console.error("Error loading JSON data:", error);
    });

    