
    let map = L.map('map', {
        zoomControl: true,
        scrollWheelZoom: false
    }).setView([44.0682, -114.7420], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    /* -------------- */
    /* Idaho Boundary */
    /* -------------- */
    const idahoBndyGroup = new L.featureGroup();
    const idahoBoundary = L.geoJSON(idahoBndy, {
        style: {
            color: '#555', // border color
            weight: 3,
            opacity: 1,
            fillColor: 'white',
            fillOpacity: 0.0
        }
    });
    idahoBoundary.addTo(idahoBndyGroup);
    idahoBndyGroup.addTo(map); //.bringToBack();

    /* -------------------------- */
    /* County spending on tobacco */
    /* -------------------------- */
    let spending;
    var countyPolySpendingGroup = new L.featureGroup();
    const countyPolysSpending = L.geoJSON(counties, {
        style: {
            color: '#555', // border color
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
        },
        onEachFeature: function(feature, layer) {
            //hh_spending.forEach(function(val) {
            county_summary.forEach(function(val) {
                if (val.GEOID === parseInt(feature.properties.GEOID)) {
                    //spending = parseFloat(val.Household_Spending_2024_Avg);
                    spending = parseFloat(val.ESRI2025_AvgHHSpendingTobacco);
                }
            });

            switch(true) {
                case (spending < 390): spendingColor = '#ffffcc'; break;
                case (spending < 470): spendingColor = '#a1dab4'; break;
                case (spending < 550): spendingColor = '#41b6c4'; break;
                default: spendingColor = '#225ea8'; break;
            }

            layer.setStyle({ fillColor: spendingColor });
            layer.bindPopup("<h5 class='mb-1'>" + feature.properties.NAME + " County</h5><p style='font-size:16px' class='alert alert-warning'>2025 Avg Household Spending<br>on Smoking Products: <strong>$" + spending.toFixed(0) + "</strong></p>");
            
        }
    }).addTo(countyPolySpendingGroup);

    /* ----------------------------- */
    /* County spending on healthcare */
    /* ----------------------------- */
    let healthcare;
    var countyPolyHealthcareGroup = new L.featureGroup();
    const countyPolysHealthcare = L.geoJSON(counties, {
        style: {
            color: '#555', // border color
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
        },
        onEachFeature: function(feature, layer) {
            county_summary.forEach(function(val) {
                if (val.GEOID === parseInt(feature.properties.GEOID)) {
                    healthcare = parseFloat(val.ESRI2025_AvgHealthcareSpending).toFixed(0);
                }
            });

            switch(true) {
                case (healthcare < 6000): healthcareColor = '#fef0d9'; break;
                case (healthcare < 7000): healthcareColor = '#fdcc8a'; break;
                case (healthcare < 8000): healthcareColor = '#fc8d59'; break;
                default: healthcareColor = '#d7301f'; break;
            }

            layer.setStyle({ fillColor: healthcareColor });
            layer.bindPopup("<h5 class='mb-1'>" + feature.properties.NAME + " County</h5><p style='font-size:16px' class='alert alert-warning'>2025 Average Household<br>Spending on Healthcare: <strong>$" + healthcare + "</strong></p>");
            
        }
    }).addTo(countyPolyHealthcareGroup);

    /* ----------------------- */
    /* County Median HH Income */
    /* ----------------------- */
    let income;
    var countyPolyIncomeGroup = new L.featureGroup();
    const countyPolysIncome = L.geoJSON(counties, {
        style: {
            color: '#555', // border color
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
        },
        onEachFeature: function(feature, layer) {
            county_summary.forEach(function(val) {
                if (val.GEOID === parseInt(feature.properties.GEOID)) {
                    income = parseFloat(val.ESRI2025_MedianHH_Income).toFixed(0);
                }
            });

            switch(true) {
                case (income < 60000): incomeColor = '#edf8fb'; break;
                case (income < 70000): incomeColor = '#b2e2e2'; break;
                case (income < 80000): incomeColor = '#66c2a4'; break;
                default: incomeColor = '#238b45'; break;
            }

            layer.setStyle({ fillColor: incomeColor });
            layer.bindPopup("<h5 class='mb-1'>" + feature.properties.NAME + " County</h5><p style='font-size:16px' class='alert alert-warning'>2025 Median Household<br>Income: <strong>$" + income + "</strong></p>");
            
        }
    }).addTo(countyPolyIncomeGroup);

    
    const schoolDistGroup = new L.featureGroup();
    async function loadSchDistricts() {
        try {
            const schDistLookup = {};
            districtEnrollmentsWithin1k.forEach(item => {
                schDistLookup[item.SchoolDistrictLong] = {
                    PctWithin1000ft: item.PctWithin1000ft,
                    TotalSchools: item.TotalSchools,
                    TotalStudents: item.TotalStudents,
                    StudentsWithin1000ft: item.StudentsWithin1000ft
                };
            });
            
            // Define color scale for ADI_STATERNK (0-10 range)
            function getStudentsExposedColor(pct) {
                if (pct === undefined || pct === null) return '#CCCCCC'; // Gray for missing data
            
                return  pct > 90  ? '#a20e30' :  // Darkest red
                    pct > 80  ? '#d03931' :
                    pct > 70  ? '#ea704a' :
                    pct > 60  ? '#f2ab65' :
                    pct > 50  ? '#f3d890' :
                    pct > 40  ? '#cfe9ea' :
                    pct > 30  ? '#a8d1e0' :
                    pct > 20  ? '#76aaca' :
                    pct > 10  ? '#4c77b0' :
                                '#3a3e94';   
            }
            
            // Style function for ADI polygons
            function styleStudentsExposed(feature) {
                const matchedData = schDistLookup[feature.properties.NAME];
                const pct = matchedData ? matchedData.PctWithin1000ft : null;
                
                return {
                    fillColor: getStudentsExposedColor(pct),
                    weight: 1,
                    opacity: 1,
                    color: '#555', //getStudentsExposedColor(pct),
                    fillOpacity: 0.7
                };
            }
            
            // Add GeoJSON layer to the feature group
            L.geoJSON(sch_districts, {
                style: styleStudentsExposed,
                onEachFeature: function(feature, layer) {
                    const matchedData = schDistLookup[feature.properties.NAME];
                    const distName = (feature.properties.NAME).split(' ').slice(0, -1).join(' ');

                    if (matchedData) {
                        const num = (matchedData.StudentsWithin1000ft).toLocaleString();
                        const totStudents = (matchedData.TotalStudents).toLocaleString();
                        const totSchools = matchedData.TotalSchools;
                        const pct = Math.round(matchedData.PctWithin1000ft * 10) / 10;
                        
                        layer.bindPopup(
                            `<div class="h5">${distName}</div>` + 
                            `<div class="h6">${pct}% of students are within 1,000 ft<br>of tobacco retail</div>` +
                            `<div class="fs-6">(${num} of ${totStudents} students from ${totSchools} schools)</div>`
                        );
                    } else {
                        layer.bindPopup(
                            `<div class="h5">${distName}</div>` + 
                            `<div class="h5">% of students that are within 1,000 ft<br>of tobacco retail</div>` +
                            `<div class="fs-6">No data</div>`
                            
                        );
                    }
                }
            }).addTo(schoolDistGroup);
            
        } catch (error) {
            console.error('Error loading School District info:', error);
        }
    }

    loadSchDistricts();


    // -------------- //
    // Load Retailers //
    // -------------- //
    var nonVapeCircleIcon = L.divIcon({
        html: '<span class="circle-letter-icon circle-t-orange">T</span>',
        iconSize: [10, 10], // Match the width and height from CSS
        iconAnchor: [10, 10] // Center the icon on the marker's location
    });
    var nonVapeCircleIcon1k = L.divIcon({
        html: '<span class="circle-letter-icon circle-red">T</span>',
    });
    var vapeCircleIcon = L.divIcon({
        html: '<span class="circle-letter-icon circle-v-purple">V</span>',
        iconSize: [10, 10], 
        iconAnchor: [10, 10] 
    });
    var vapeCircleIcon1k = L.divIcon({
        html: '<span class="circle-letter-icon circle-red">V</span>',
        iconSize: [10, 10],
        iconAnchor: [10, 10] 
    });


    var retailersGroup = new L.featureGroup();
    var retailersGroup1k = new L.featureGroup();
    var exposureZonesGroup = new L.featureGroup();
    var setTobaccoIcon = nonVapeCircleIcon;

    retailers.forEach(retailer => {
        var county = retailer.County;
        var lat = retailer.Latitude;
        var lng = retailer.Longitude;
        var retailerName = retailer.OutletName;
        var retailerType = retailer.VendorType;
        var address = retailer.Address;
        var city = retailer.City;
        var within1k = retailer.Within1000ftSch;

        // add retailers within 1,000 ft to retailersGroup1k
        if (within1k == 'yes') {
            if( retailerType.toLowerCase().includes('vap') || retailerName.toLowerCase().includes('vap') ) {
                setTobaccoIcon = vapeCircleIcon1k;
            } else {
                setTobaccoIcon = nonVapeCircleIcon1k;
            }
            var circleIcon = L.marker( [lat,lng], { icon: setTobaccoIcon });
            circleIcon.bindPopup('<b>' + retailerName + '</b><br>' + address + '<br>' + city + ', ID<br>' + retailerType);
            retailersGroup1k.addLayer(circleIcon);
        } 

        // add ALL retailers to retailersGroup
        if( retailerType.toLowerCase().includes('vap') || retailerName.toLowerCase().includes('vap') ) {
            setTobaccoIcon = vapeCircleIcon;
        } else {
            setTobaccoIcon = nonVapeCircleIcon;
        }

        var triangleIcon = L.divIcon({
            className: 'square',
            iconSize: [12, 12], // Width and height of the icon container
            iconAnchor: [12, 12] // Half of width, and full height to anchor the tip
        });
        var retailTriangleMarker = L.marker([lat,lng], { icon: triangleIcon });
        retailTriangleMarker.bindPopup('<b>' + retailerName + '</b><br>' + address + '<br>' + city + ', ID<br>' + retailerType);
        retailersGroup.addLayer(retailTriangleMarker);
        
        retailersGroup.addTo(map);

        var radiusInMeters = 304.8;
        var exposureCircle = L.circle( [lat,lng], {
            color: 'red',        // Color of the stroke (outline)
            weight: 0,       
            //fillColor: '#f03',   // Color of the fill
            fillColor: 'black',   // Color of the fill
            fillOpacity: 0.3,    // Opacity of the fill
            radius: radiusInMeters // The radius in meters
        });
        exposureZonesGroup.addLayer(exposureCircle);
    });


    /* -------------- */
    /*  Load Schools  */
    /* -------------- */
  
    var schoolsGroup = new L.featureGroup();
    var schoolsGroup1k = new L.featureGroup();
    schools2023.forEach(school => {
        var county = school.County;
        var lat = school.Latitude;
        var lng = school.Longitude;
        var schoolName = school.SchoolName;
        var schoolType = school.Type;
        var lowGrade = school.LowGrade;
        var highGrade = school.HighGrade;
        var address = school.Address;
        var city = school.City;
        var risk = school.Within1000ft;
        var students = school.Students;
             
        map.createPane('schoolMarkerPane');
        map.getPane('schoolMarkerPane').style.zIndex = 650;
        
        var schoolCircleIcon = L.circleMarker( [lat,lng], {
            pane: 'schoolMarkerPane',
            color: '#ffffff', //'#67a9cf', //'deepskyblue',        // Color of the stroke (outline)
            weight: 1,       
            fillColor: 'deepskyblue', //'#67a9cf',   // Color of the fill
            fillOpacity: 0.7,    // Opacity of the fill
            radius: 6
            //radius: radiusInMeters // The radius in meters
        });
        schoolCircleIcon.bindPopup('<b>' + schoolName + '</b><br>' + address + '<br>' + city + ', ID<br>[ ' + schoolType + ' ]<br>Grades: ' + lowGrade + ' - ' + highGrade + '<br>Number of students: ' + students);

        schoolsGroup.addLayer(schoolCircleIcon); 
        schoolsGroup.addTo(map);

        // for schools within 1k ft of retailer
        if (risk === 'yes') {
            var schoolCircleIcon1k = L.circleMarker( [lat,lng], {
                pane: 'schoolMarkerPane',
                color: '#ffffff', //'magenta',       // Color of the stroke (outline)
                weight: 1,       
                fillColor: 'magenta',   // Color of the fill
                fillOpacity: 1,    // Opacity of the fill
                radius: 6
            });
            schoolCircleIcon1k.bindPopup('<b>' + schoolName + '</b><br>' + address + '<br>' + city + ', ID<br>[ ' + schoolType + ' ]<br>Grades: ' + lowGrade + ' - ' + highGrade + '<br>Number of students: ' + students);
            schoolsGroup1k.addLayer(schoolCircleIcon1k);
        }
    });

    // Create Schools Chart
    function createSchoolsChart() {
        const data = [{
            values: [761,82],
            labels: ['Public Schools', 'Private Schools'],
            type: 'pie',
            marker: {
                colors: ['#0571b0', '#fee090']
            },
            textinfo: 'label+percent',
            textposition: 'inside',
            hoverinfo: 'label+value+percent'
        }];

        const layout = {
            title: 'Idaho K-12 Schools by Type',
            showlegend: false,
            height: 350,
            margin: { l: 30, r: 30, b: 30, t: 30 }
        };

        Plotly.newPlot('schoolsChart', data, layout, {responsive: true});
    }

    // Create Retailers Chart
    function createRetailersChart() {
        const data = [{
            values: [843, 253, 229, 130, 124, 81],
            labels: ['Convenience/<br>Gas Station', 'Tobacco/<br>Vape Shop', 'Grocer', 'Bar/Lounge', 'Discount/<br>Drug Store', 'Other', ],
            type: 'pie',
            marker: {
                colors: ['#b35806', '#f1a340', '#fee0b6', '#d8daeb', '#998ec3', '#542788']
            },
            textinfo: 'label+percent',
            textposition: 'inside',
            hoverinfo: 'label+value+percent'
        }];

        const layout = {
            title: 'Tobacco Retailers by Type',
            showlegend: false,
            height: 350,
            margin: { l: 30, r: 30, b: 30, t: 30 }
        };

        Plotly.newPlot('retailersChart', data, layout, {responsive: true});
    }

    // Create Proximity Chart
    /*
    function createProximityChart() {
        const data = [{
            x: ['Schools within 1,000 ft<br>of Retailer', 'Retailers within 500 ft<br>of Another Retailer'],
            y: [19.6, 40.4],
            type: 'bar',
            orientation: 'horizontal',
            marker: {
                color: ['#e74c3c', '#f39c12']
            },
            text: ['19.6%', '40.4%'],
            textposition: 'auto',
            textfont: {
                size: 16,
                color: 'white'
            }
        }];

        const layout = {
            yaxis: {
                title: 'Percentage (%)',
                range: [0, 100]
            },
            xaxis: {
                tickfont: { size: 12 }
            },
            showlegend: false,
            height: 400
        };

        Plotly.newPlot('proximityChart', data, layout, {responsive: true});
    } */

    // Initialize charts
    createSchoolsChart();
    createRetailersChart();
    //createProximityChart();


    /* ---------------------- */
    /* ---- COUNTY STATS ---- */
    /* ---------------------- */
    // County dropdown handler
    let selectCountyElem = document.getElementById('countySelect');
    selectCountyElem.addEventListener('change', updateCountyStats);
    const countyStatsElem = document.getElementById('countyStats');

    function updateCountyStats() {
        countyStatsElem.style.display = 'block';
        const selectedCounty = selectCountyElem.value;
        
        const e = document.getElementsByClassName('countySelected');
        for (let i = 0; i < e.length; i++) {
            e[i].textContent = selectedCounty + ' County';
        }

        // Find the matching county in the JSON
        const countyData = county_summary.find(
            c => c.County.toLowerCase() === selectedCounty.toLowerCase() + ' county'
        );

        if (countyData) {
            let population = countyData.Census_Pop2024;
            //let population = countyData.ESRI_Pop2025;
            let totRetail = countyData.TotalRetailers2024;
            let retail500ftRetail = countyData.Retail_in500ft_of_Retail_2024;
            let retail1000ftRetail = countyData.Retail_in1000ft_of_Retail_2024;
            let spendingCounty = countyData.ESRI2025_AvgHHSpendingTobacco;
            let spendingBar = spendingCounty/10;
            let medianIncome = countyData.ESRI2025_MedianHH_Income;
            let healthcareSpending = countyData.ESRI2025_AvgHealthcareSpending;
            
            let pctRetail500ftRetail = 0;
            if (retail500ftRetail > 0) pctRetail500ftRetail =  (retail500ftRetail/totRetail * 100).toFixed(1);
            if (pctRetail500ftRetail == 0) {
                document.getElementById('statZero-r2r500-county').innerHTML = '0%<br>';
            } else {
                document.getElementById('statZero-r2r500-county').innerHTML = '';
            }
            
            //let pctRetail1000ftRetail =  0;
            //if (retail1000ftRetail > 0) pctRetail1000ftRetail = (retail1000ftRetail/totRetail * 100).toFixed(1);
            
            let retailPer1kPeople = totRetail/population * 1000;
            let level = "";
            let bgColor = "";
            let txtColor = "";
            if (retailPer1kPeople < 1 ) {
                level = "low"; bgColor = "bg-success"; txtColor = "text-light";
            } else if (retailPer1kPeople > 1.001 && retailPer1kPeople < 2.001) {
                level = "medium"; bgColor = "bg-warning"; txtColor = "text-dark";
            } else if (retailPer1kPeople > 2 ) {
                level = "high"; bgColor = "bg-danger"; txtColor = "text-light";
            } 
            
            let totSchools = countyData.TotalSchools2023;
            let schools1kRetail = countyData.Schools_in1000ft_of_Retail;
            let pctSchools1k = 0;
            if ( schools1kRetail > 0 ) pctSchools1k = (schools1kRetail/totSchools * 100).toFixed(1);
            if (pctSchools1k == 0) {
                document.getElementById('statZero-schoolsNear-county').innerHTML = '0%<br>';
            } else {
                document.getElementById('statZero-schoolsNear-county').innerHTML = '';
            }

            let totStudents = countyData.TotalStudents2023;
            let students1kRetail = countyData.Students_in1000ft_of_Retail;
            let pctStudents1k = 0;
            if (students1kRetail > 0) pctStudents1k = (students1kRetail/totStudents * 100).toFixed(1);
            if (pctStudents1k == 0) {
                document.getElementById('statZero-studentsNear-county').innerHTML = '0%<br>';
            } else {
                document.getElementById('statZero-studentsNear-county').innerHTML = '';
            }
            
            //let retail1kSch = countyData.Retail_in1000ft_of_School;
            //let pctRetail1kSch = 0;
            //if (retail1kSch > 0) pctRetail1kSch = (retail1kSch/totRetail * 100).toFixed(1);
            
            let per1000people = retailPer1kPeople; 
            let per1000peopleBar = retailPer1kPeople * 25;
            
            const retailBarCounty = document.getElementById('retail-bar-county');
            retailBarCounty.style.width = pctRetail500ftRetail + "%";
            retailBarCounty.innerText = pctRetail500ftRetail + "%";

            const schoolsBarCounty = document.getElementById('schools-bar-county');
            schoolsBarCounty.style.width = pctSchools1k + "%";
            schoolsBarCounty.innerText = pctSchools1k + "%";

            const studentsBarCounty = document.getElementById('students-bar-county');
            studentsBarCounty.style.width = pctStudents1k + "%";
            studentsBarCounty.innerText = pctStudents1k + "%";

            const spendingBarCounty = document.getElementById('spending-bar-county');
            spendingBarCounty.style.width = spendingBar * 1.58 + "%";
            spendingBarCounty.innerText = "$" + spendingCounty.toFixed(0).toString();

            const per1000BarCounty = document.getElementById('per1000-bar-county');
            per1000BarCounty.classList.remove('bg-success', 'bg-warning', 'bg-danger', 'text-light', 'text-dark');
            per1000BarCounty.classList.add(bgColor, txtColor);
            //console.log(per1000peopleBar + ',' + per1000people);
            per1000BarCounty.style.width = per1000peopleBar + "%";
            //per1000BarCounty.innerText = per1000people.toFixed(2);
            per1000BarCounty.innerText = level;

            // Populate divs with the data
            document.getElementById('totRetailByCounty').textContent = totRetail.toLocaleString();
            document.getElementById('totSchoolsByCounty').textContent = totSchools.toLocaleString();
            document.getElementById('totStudentsByCounty').textContent = totStudents.toLocaleString();
            document.getElementById('retailersPer1000ByCounty').textContent = retailPer1kPeople.toFixed(2);
            document.getElementById('avgSpending2025_byCnty').textContent = '$' + spendingCounty.toFixed(0);
            document.getElementById('avgHealthcare2025_byCnty').textContent = '$' + (healthcareSpending.toFixed(0)).toLocaleString();
            document.getElementById('medIncome2025_byCnty').textContent = '$' + (medianIncome.toFixed(0)).toLocaleString();
        } else {
            countyStatsElem.style.display = 'none';
            document.getElementById('totRetailByCounty').textContent = '';
            document.getElementById('totSchoolsByCounty').textContent = '';
            document.getElementById('totStudentsByCounty').textContent = '';
            document.getElementById('retailersPer1000ByCounty').textContent = '';
            document.getElementById('avgSpending2025_byCnty').textContent = '';
            document.getElementById('avgHealthcare2025_byCnty').textContent = '';
            document.getElementById('medIncome2025_byCnty').textContent = '';
        }
    }

    /* -------------------------------- */
    /* ---- SCHOOL DISTRICTS STATS ---- */
    /* -------------------------------- */
    
    // Function to convert a string to Title Case, instead of ALL CAPS
    const toTitleCase = (str) => {
        if (!str) return str;
        return str.toLowerCase().split(' ').map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    };

    // Populate select list for School Districts
    const schDistLookup = {};
    schdist_summary.forEach(item => {
        schDistLookup[item.SchoolDistrictLong] = {
            TotalRetail: item.TotalRetailers2024,
            TotalSchools: item.TotalSchools2023,
            SchoolsWithin1000ft: item.Schools_in1000ft_of_Retail,
            TotalStudents: item.TotalStudents2023,
            StudentsWithin1000ft: item.Students_in1000ft_of_Retail,
            SchoolDistrictNames: item.SchoolDistrict
        };
    });
    const districtNames = Object.values(schDistLookup)
        .map(item => item.SchoolDistrictNames)
        .filter(name => name)
        .sort();
    const selectElementSD = document.getElementById('districtSelect');
    if (selectElementSD) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '--- Select a School District ---';
        defaultOption.disabled = true;
        defaultOption.selected = true; // Makes it the default choice
        selectElementSD.appendChild(defaultOption);

        districtNames.forEach(name => {
            const option = document.createElement('option');
            // The value attribute and the visible text should be the name
            option.value = name;
            option.textContent = toTitleCase(name);
            selectElementSD.appendChild(option);
        });

    } else {
        console.error("Target select element with ID 'sd' not found.");
    }

    // County dropdown handler
    let selectDistrictElem = document.getElementById('districtSelect');
    selectDistrictElem.addEventListener('change', updateDistrictStats);
    const districtStatsElem = document.getElementById('districtStats');

    function updateDistrictStats() {

        districtStatsElem.style.display = 'block';
        const selectedDistrict = selectDistrictElem.value;
        
        const d = document.getElementsByClassName('districtSelected');
        for (let i = 0; i < d.length; i++) {
            d[i].textContent = selectedDistrict;
        }

        // Find the matching district in the JSON
        const districtData = schdist_summary.find(
            d => d.SchoolDistrict === selectedDistrict 
        );
        
        if (districtData) {
            let population = districtData.SAIPE23_TotalPopulation2023;
            let totRetail = districtData.TotalRetailers2024;
            let retail500ftRetail = districtData.Retail_in500ft_of_Retail_2024;
            let retail1000ftRetail = districtData.Retail_in1000ft_of_Retail_2024;
            
            let pctRetail500ftRetail = 0;
            if (retail500ftRetail > 0) pctRetail500ftRetail = (retail500ftRetail/totRetail * 100).toFixed(1);
            if (pctRetail500ftRetail == 0) {
                document.getElementById('statZero-r2r500-district').innerHTML = '0%<br>';
            } else {
                document.getElementById('statZero-r2r500-district').innerHTML = '';
            }
            
            //let pctRetail1000ftRetail =  0;
            //if (retail1000ftRetail > 0) pctRetail1000ftRetail = (retail1000ftRetail/totRetail * 100).toFixed(1);
            
            let retailPer1kPeople = totRetail/population * 1000;
            
            let totSchools = districtData.TotalSchools2023;
            let schools1kRetail = districtData.Schools_in1000ft_of_Retail;
            let pctSchools1k = 0;
            if(schools1kRetail > 0) pctSchools1k = (schools1kRetail/totSchools * 100).toFixed(1);
            if (pctSchools1k == 0) {
                document.getElementById('statZero-schoolsNear-district').innerHTML = '0%<br>';
            } else {
                document.getElementById('statZero-schoolsNear-district').innerHTML = '';
            }
            
            let totStudents = districtData.TotalStudents2023;
            let students1kRetail = districtData.Students_in1000ft_of_Retail;
            let pctStudents1k = 0;
            if (students1kRetail > 0) pctStudents1k = (students1kRetail/totStudents * 100).toFixed(1);
            if (pctStudents1k == 0) {
                document.getElementById('statZero-studentsNear-district').innerHTML = '0%<br>';
            } else {
                document.getElementById('statZero-studentsNear-district').innerHTML = '';
            }
            
            let retail1kSch = districtData.Retail_in1000ft_of_School;
            let pctRetail1kSch = 0;
            if (retail1kSch > 0) pctRetail1kSch = (retail1kSch/totRetail * 100).toFixed(1);
            
            const retailBarDistrict = document.getElementById('retail-bar-district');
            retailBarDistrict.style.width = pctRetail500ftRetail + "%";
            retailBarDistrict.innerText = pctRetail500ftRetail + "%";

            const schoolsBarDistrict = document.getElementById('schools-bar-district');
            schoolsBarDistrict.style.width = pctSchools1k + "%";
            schoolsBarDistrict.innerText = pctSchools1k + "%";

            const studentsBarDistrict = document.getElementById('students-bar-district');
            studentsBarDistrict.style.width = pctStudents1k + "%";
            studentsBarDistrict.innerText = pctStudents1k + "%";
            
            // Populate divs with the data
            document.getElementById('totRetailBySD').textContent = totRetail.toLocaleString();
            document.getElementById('totSchoolsBySD').textContent = totSchools.toLocaleString();
            document.getElementById('totStudentsBySD').textContent = totStudents.toLocaleString();
            document.getElementById('retailersPer1000BySD').textContent = retailPer1kPeople.toFixed(2);
    
        } else {
            document.getElementById('totRetailBySD').textContent = '';
            document.getElementById('totSchoolsBySD').textContent = '';
            document.getElementById('totStudentsBySD').textContent = '';
            document.getElementById('retailersPer1000BySD').textContent = '';
        }
    
    }


    /* ----------------------- */
    /* HANDLE SCROLLING EVENTS */
    /* ----------------------- */
    const sections = document.querySelectorAll('[data-type]');
    const mapElement = document.getElementById('map');
    let currentSection = -1;
    let currentMapType = null;
    let newMapType = null;
    let isChartVisible = false;

    function updateView() {
        const scrollPos = window.scrollY;
        const windowHeight = window.innerHeight;

        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const sectionMiddle = rect.top + rect.height / 2;

            if (sectionMiddle > windowHeight * 0.2 && sectionMiddle < windowHeight * 0.9) {
                const type = section.dataset.type;
                //console.log("data-type: " + type);

                if (type === 'chart') {
                    isChartVisible = true;
                } else if (type === 'map') {
                    const content = section.querySelector('.story-content');
                    const mapStyle = section.dataset.mapStyle;
                    console.log("mapStyle: " + mapStyle);
                    
                    if (currentSection !== index) {
                        currentSection = index;
                        const lat = parseFloat(section.dataset.lat);
                        let lng = parseFloat(section.dataset.lng) - 3;
                        if (mapStyle === 'boise' || mapStyle === 'proximity') lng = parseFloat(section.dataset.lng);
                        const zoom = parseInt(section.dataset.zoom);

                        map.flyTo([lat, lng], zoom, {
                            duration: 2,
                            easeLinearity: 0.25
                        });
                        
                        newMapType = mapStyle;
                    }
                    if (content) content.classList.remove('fade-out');
                }
            } else {
                if (section.dataset.type === 'map') {
                    const content = section.querySelector('.story-content');
                    if (content) content.classList.add('fade-out');
                }
            }
        });

        // Update map layers based on section
        if (newMapType !== currentMapType) {
            currentMapType = newMapType;
            
            // Remove all overlays first
            if (map.hasLayer(idahoBndyGroup)) {
                map.removeLayer(idahoBndyGroup);
                map.removeLayer(schoolsGroup);
                map.removeLayer(retailersGroup);
                document.querySelector('.schools-legend').style.display = 'none';
                document.querySelector('.retailers-legend').style.display = 'none';
            }
            if (map.hasLayer(schoolsGroup1k)) {
                map.removeLayer(idahoBndyGroup);
                map.removeLayer(schoolsGroup);
                map.removeLayer(schoolsGroup1k);
                map.removeLayer(exposureZonesGroup);
                document.querySelector('.schools1k-legend').style.display = 'none';
                document.querySelector('.schools-legend').style.display = 'none';
                document.querySelector('.exposurezone-legend').style.display = 'none';
                document.querySelector('.sch-retail-1000ft-legend').style.display = 'none'; 
            }
            if (map.hasLayer(countyPolySpendingGroup)) {
                map.removeLayer(countyPolySpendingGroup);
                document.querySelector('.spending-legend').style.display = 'none';
            }
            if (map.hasLayer(countyPolyHealthcareGroup)) {
                map.removeLayer(countyPolyHealthcareGroup);
                document.querySelector('.healthcare-legend').style.display = 'none';
            }
            if (map.hasLayer(countyPolyIncomeGroup)) {
                map.removeLayer(countyPolyIncomeGroup);
                document.querySelector('.income-legend').style.display = 'none';
            }
            if (map.hasLayer(schoolDistGroup)) {
                map.removeLayer(schoolDistGroup);
                document.querySelector('.schdist-legend').style.display = 'none';
            }
            
            // Add appropriate overlay
            if (currentMapType === 'idaho') {
                idahoBndyGroup.addTo(map);
                retailersGroup.addTo(map);
                schoolsGroup.addTo(map).bringToFront();
                document.querySelector('.schools-legend').style.display = 'block';
                document.querySelector('.retailers-legend').style.display = 'block';
            } else if (currentMapType === 'proximity') {
                idahoBndyGroup.addTo(map);
                exposureZonesGroup.addTo(map);
                schoolsGroup.addTo(map);
                schoolsGroup1k.addTo(map);
                document.querySelector('.exposurezone-legend').style.display = 'block';
                document.querySelector('.schools1k-legend').style.display = 'block';
                document.querySelector('.schools-legend').style.display = 'block';
                document.querySelector('.sch-retail-1000ft-legend').style.display = 'block'; 
            } else if (currentMapType === 'tobaccospending') {
                countyPolySpendingGroup.addTo(map);
                document.querySelector('.spending-legend').style.display = 'block';
            } else if (currentMapType === 'healthcare') {
                countyPolyHealthcareGroup.addTo(map);
                document.querySelector('.healthcare-legend').style.display = 'block';
            } else if (currentMapType === 'income') {
                countyPolyIncomeGroup.addTo(map);
                document.querySelector('.income-legend').style.display = 'block';
            } else if (currentMapType === 'districts') {
                schoolDistGroup.addTo(map);
                document.querySelector('.schdist-legend').style.display = 'block';
            } else if (currentMapType === 'boise') {
                idahoBndyGroup.addTo(map);
            }
        }

        //if (isChartVisible) {
        //    mapElement.classList.add('hidden');
        //} else {
        //    mapElement.classList.remove('hidden');
        //}
    }
    

    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            //console.log('does this happen?');
            ticking = true;
            window.requestAnimationFrame(() => {
                updateView();
                ticking = false;
            });
        }
    });

    updateView();


    /* -------- */
    /*  LEGEND  */
    /* -------- */
    var legend = L.control({position: 'topright'});

    legend.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'info legend');
        this.update();
        return this._div;
    };

    var legendText = '<div class="map-legend"><p class="h5 text-center">LEGEND</p>';

    legendText += '<div class="schdist-legend" style="display:none"><hr />';
    legendText += '<h6 class="text-center">% of Students within<br>1,000 ft of Tobacco Retail<br>(by School District, 2023)</h6><p class="mb-0 text-center">';
    legendText += '<span style="opacity:0.8;background-color:#3a3e94">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#4c77b0">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#76aaca">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#a8d1e0">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#cfe9ea">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#f3d890">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#f2ab65">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#ea704a">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#d03931">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#a20e30">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>';
    legendText += '<p class="small ms-3 mb-0">0 &nbsp;10 &nbsp;20&nbsp; 30&nbsp; 40&nbsp; 50&nbsp; 60&nbsp;70&nbsp; 80&nbsp; 90&nbsp;100</p>';
    legendText += '<p class="text-center mt-0 small">%</p></div>';

    legendText += '<div class="county-legend" style="display:none"><hr />';
    legendText += '<h6 class="text-center">Retailers per 1,000 People<br>(2024)</h6><p class="mb-0">';
    legendText += '<span style="opacity:0.8;background-color:#3a3e94">&nbsp;&nbsp;&nbsp; &nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#4c77b0">&nbsp;&nbsp;&nbsp; &nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#76aaca">&nbsp;&nbsp;&nbsp; &nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#a8d1e0">&nbsp;&nbsp;&nbsp; &nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#cfe9ea">&nbsp;&nbsp;&nbsp; &nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#f3d890">&nbsp;&nbsp;&nbsp; &nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#f2ab65">&nbsp;&nbsp;&nbsp; &nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#ea704a">&nbsp;&nbsp;&nbsp; &nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#d03931">&nbsp;&nbsp;&nbsp; &nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#a20e30">&nbsp;&nbsp; &nbsp; &nbsp;</span><br>';
    legendText += '<small>0 &nbsp;0.4 &nbsp;0.8 &nbsp;1.2 &nbsp;1.6 &nbsp;2.0 &nbsp;2.4 &nbsp;2.8 &nbsp;3.2 &nbsp;3.6</small>';
    legendText += '</p></div>';

    legendText += '<div class="density-legend" style="display:none"><hr />';
    legendText += '<h6 class="text-center">Percent of Tobacco Retailers within<br>1,000 ft of another Tobacco Retailer<br>(by County)</h6><p class="mb-0 text-center">';
    legendText += '<span style="opacity:0.8;background-color:#3a3e94">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#4c77b0">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#76aaca">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#a8d1e0">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#cfe9ea">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#f3d890">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#f2ab65">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#ea704a">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#d03931">&nbsp;&nbsp;&nbsp;&nbsp; </span>';
    legendText += '<span style="opacity:0.8;background-color:#a20e30">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>';
    legendText += '<p class="small ms-3 mb-0">&nbsp; 0 &nbsp;10 &nbsp;20&nbsp; 30&nbsp; 40&nbsp; 50&nbsp; 60&nbsp; 70&nbsp; 80&nbsp; 90&nbsp;100</p>';
    legendText += '<p class="text-center mt-0 small">%</p></div>';

    legendText += '<div class="spending-legend" style="display:none"><hr /><h6 class="text-center">Average Household<br>Spending on<br>Smoking Products<br>in 2025</h6><p class="mb-0">';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#225ea8">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; $550 - $630<br>';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#41b6c4">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; $470 - $549<br>';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#a1dab4">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; $390 - $469<br>';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#ffffcc">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; $310 - $389';
    legendText += '</p></div>';

    legendText += '<div class="healthcare-legend" style="display:none"><hr /><h6 class="text-center">Average Household<br>Healthcare Spending<br>in 2025</h6><p class="mb-0">';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#d7301f">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; $8,000 - $8,999<br>';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#fc8d59">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; $7,000 - $7,999<br>';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#fdcc8a">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; $6,000 - $6,999<br>';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#fef0d9">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; $4,500 - $5,999';
    legendText += '</p></div>';

    legendText += '<div class="income-legend" style="display:none"><hr /><h6 class="text-center">Median Household<br>Income in 2025</h6><p class="mb-0">';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#238b45">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; $80,000 - $100,000<br>';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#66c2a4">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; $70,000 - $79,999<br>';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#b2e2e2">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; $60,000 - $69,999<br>';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#edf8fb">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; $46,000 - $59,999';
    legendText += '</p></div>';


    legendText += '<div class="schools-legend mb-2" style="display:none"><div class="blue-circle"></div> School</div>';
    legendText += '<div class="schools1k-legend mb-2" style="display:none"><div class="magenta-circle"></div> School within 1,000 ft of retail</div>';
    legendText += '<div class="exposurezone-legend mb-2" style="display:none"><div class="grey-circle"></div> Tobacco exposure zone</div>';
    legendText += '<div class="sch-retail-1000ft-legend mb-2" style="display:none"><hr /><img src="img/sch_retail_1000ft.png" style="width:230px" /></div>';
    //legendText += '<span class="fa-stack" style="font-size: 0.55rem;"><i class="fas fa-square fa-stack-2x" style="color:magenta;"></i><i class="fa fa-university fa-stack-1x fa-inverse" style="color:white;"></i></span> School within 1,000 ft<br />&nbsp;&nbsp;&nbsp; of tobacco retailer</p>';
    //legendText += '<hr />';
    legendText += '<div class="retailers-legend mb-0" style="display:none">';
    //legendText += '<i class="fas fa-circle" style="color:black;opacity:0.4;border-radius:50%"></i> Tobacco Exposure Zone<br>';
    legendText += '<div class="square"></div> Tobacco Retailer';
    //legendText += '<span class="fa-stack" style="font-size: 0.55rem;"><i class="fas fa-circle fa-stack-2x" style="color:purple;border:1px solid white;border-radius:50%"></i><i class="fas fa-v fa-stack-1x fa-inverse" style="color:white"></i></span> Vape Retailer<br>';
    //legendText += '<span class="fa-stack" style="font-size: 0.55rem;"><i class="fas fa-circle fa-stack-2x" style="color:red;border:1px solid white;border-radius:50%"></i><i class="fas fa-t fa-stack-1x fa-inverse" style="color:white"></i></span>';
    //legendText += '<span class="fa-stack" style="font-size: 0.55rem;"><i class="fas fa-circle fa-stack-2x" style="color:red;border:1px solid white;border-radius:50%"></i><i class="fas fa-v fa-stack-1x fa-inverse" style="color:white"></i></span> Retailer within<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1,000 ft of school';
    legendText += '</div>';
    legendText += '<div class="saipe-legend" style="display:none"><hr /><h5 class="text-center">POVERTY</h5><p class="text-center">Percent of Children Age<br>5-17 Living in Poverty</p><p class="mb-0">';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#225ea8">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; > 19% <br>';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#41b6c4">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; 15-19% <br>';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#a1dab4">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; 10-14% <br>';
    legendText += '&nbsp;<span style="opacity:0.8;border:1px solid #555;background-color:#ffffcc">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; < 10%';
    legendText += '</p></div>';
    
    legendText += '</div>';
    

legend.update = function () {
    this._div.innerHTML = legendText;
};

legend.addTo(map);
