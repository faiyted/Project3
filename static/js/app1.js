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
        width: 900,
        height: 900
    };

    // Plot the Sunburst chart using Plotly
    Plotly.newPlot('sunburst-chart', [trace], layout);
}




// Load the JSON and draw the chart
d3.json('../cleanDataset.json')
    .then(data => {
        drawChart(data, 'Industry', 'Job_Role');
        drawBarChart(data); 
        drawSunburstChart(data);

        
    })
    .catch(error => {
        console.error("Error loading JSON data:", error);
    });

    