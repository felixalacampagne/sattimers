function getMinYear()
{
   // Apparently browsers should now all support getting the actual year with getFullYear
   var y = new Date().getFullYear();  
   y -= 1;
   return y;
}

function getParams() {
	var idx = document.URL.indexOf('?');
	var tempParams = new Object();
	if (idx != -1) {
		var pairs = document.URL.substring(idx+1, document.URL.length).split('&');
		for (var i=0; i<pairs.length; i++) {
			nameVal = pairs[i].split('=');
			tempParams[nameVal[0]] = nameVal[1];
			//alert(nameVal[0] + "=" + nameVal[1]);
		}
	}
	return tempParams;
}

function nocache(pfx)
{
	// Can't simply append this to every URL as the prefix depends on
	// whether there are already parameters. So simpler to get the caller to 
	// figure it out
	var nocache=new Date().getTime();
	return pfx + "nocache=" + nocache
}


function zeropad(num, cnt)
{
	var pad = "000000000000000000000000000000"+num;
	pad = pad.substr(pad.length-cnt, cnt);
	return pad;
}

function checkChannelValue() {
	//alert(document.addtimer.ref.selectedIndex);
	if(document.addtimer.sref.selectedIndex != -1) {
		return true;
	}
	return false;
}


function allCheckBoxes(form){
	for (var x = 0; x< form.elements.length; x++) {
		var y = form.elements[x];
		if (y.name != 'EVERYDAY') {
			y.checked = form.EVERYDAY.checked;
		}
	}
}
function changeMin (SE) {
	if (document.addtimer.smin.selectedIndex > document.addtimer.emin.selectedIndex) {
		if (document.addtimer.shour.selectedIndex == document.addtimer.ehour.selectedIndex) {
			if (document.addtimer.sday.selectedIndex == document.addtimer.eday.selectedIndex) {
				if(document.addtimer.smonth.selectedIndex == document.addtimer.emonth.selectedIndex) {
					if(document.addtimer.syear.selectedIndex == document.addtimer.eyear.selectedIndex) {
						if(SE == 's') {
							document.addtimer.emin.selectedIndex = document.addtimer.smin.selectedIndex;
     						} else {
     							document.addtimer.smin.selectedIndex = document.addtimer.emin.selectedIndex;
     						}
     					}
     				}
     			}
     		}
     	}
}

function changeHour (SE) {
	// CPA
	setEndDValues(document.addtimer.syear.options[document.addtimer.syear.selectedIndex].text,document.addtimer.smonth.selectedIndex + 1,document.addtimer.sday.selectedIndex + 1);
	dodateString();
	return;
	//End CPA
	if (document.addtimer.shour.selectedIndex > document.addtimer.ehour.selectedIndex) {
		if (document.addtimer.sday.selectedIndex == document.addtimer.eday.selectedIndex) {
			if(document.addtimer.smonth.selectedIndex == document.addtimer.emonth.selectedIndex) {
				if(document.addtimer.syear.selectedIndex == document.addtimer.eyear.selectedIndex) {
					if(SE == 's') {
						document.addtimer.ehour.selectedIndex = document.addtimer.shour.selectedIndex;
					} else {
						document.addtimer.shour.selectedIndex = document.addtimer.ehour.selectedIndex;
					}
				}
			}
     		}
	}
}

function changeDay (SE)
{
	if(SE == 's')
	{
		setEndDValues(document.addtimer.syear.options[document.addtimer.syear.selectedIndex].text,
		              document.addtimer.smonth.selectedIndex + 1,
		              document.addtimer.sday.selectedIndex + 1);
	}
	else
	{
		if (document.addtimer.sday.selectedIndex > document.addtimer.eday.selectedIndex) {
			if(document.addtimer.smonth.selectedIndex == document.addtimer.emonth.selectedIndex) {
				if(document.addtimer.syear.selectedIndex == document.addtimer.eyear.selectedIndex) {
					if(SE == 's')
					{
						// CPA
						// document.addtimer.eday.selectedIndex = document.addtimer.sday.selectedIndex;
					} else {
						document.addtimer.sday.selectedIndex = document.addtimer.eday.selectedIndex;
					}
				}
			}
		}
	}
	// CPA Fills in the day for the currently selected start/end dates
	dodateString();
	// End CPA
}

function changeMonth (SE) {
	if (document.addtimer.smonth.selectedIndex > document.addtimer.emonth.selectedIndex) {
		if(document.addtimer.syear.selectedIndex == document.addtimer.eyear.selectedIndex) {
			if(SE == 's') {
				document.addtimer.emonth.selectedIndex = document.addtimer.smonth.selectedIndex;
			} else {
				document.addtimer.smonth.selectedIndex = document.addtimer.emonth.selectedIndex;
			}
		}
	}
	// CPA Fills in the day for the currently selected start/end dates
	dodateString();
	// End CPA
}

function changeYear (SE) {
	if (document.addtimer.syear.selectedIndex > document.addtimer.eyear.selectedIndex) {
		if(SE == 's') {
     			document.addtimer.eyear.selectedIndex = document.addtimer.syear.selectedIndex;
     		} else {
     			document.addtimer.syear.selectedIndex = document.addtimer.eyear.selectedIndex;
     		}
	}
	// CPA Fills in the day for the currently selected start/end dates
	dodateString();
	// End CPA

}


// CPA
function dodateString()
{
	var days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

	var d = new Date();
	d.setTime(0);
	d.setYear(document.addtimer.syear.options[document.addtimer.syear.selectedIndex].text);
	d.setMonth(document.addtimer.smonth.selectedIndex);
   d.setDate(document.addtimer.sday.selectedIndex);
	// This should have the format Day, Month Date, Year Time, but it misses the Day - which is the
	// whole bloody point of the exercise!
	//document.addtimer.descr.value = d.toLocaleString();
	document.all.item("dayname").innerText = days[d.getDay()];
}

function setStartDate(anchor)
{
var cal = new CalendarPopup("caldiv");
	cal.setReturnFunction("setStartDValues");
	var y = document.addtimer.syear.options[document.addtimer.syear.selectedIndex].text;
	var m = document.addtimer.smonth.selectedIndex + 1;
	var d =document.addtimer.sday.selectedIndex + 1;
	// 30-Apr-2015 New version appears to require a formatted date, ie. y-M-d!!
	//cal.showCalendar(anchor, y, m, d);
	var fd = y + "-" + m + "-" + d;
	cal.showCalendar(anchor, fd);
}

function setStartDValues(y,m,d)
{
var now = new Date();

	// In real life recordings are never more than a day.
	// The might span midnight though in which case an extra day should be added
	// to the start date.
	document.addtimer.syear.selectedIndex = (y - getMinYear());
	document.addtimer.smonth.selectedIndex=(m-1);
	document.addtimer.sday.selectedIndex=(d-1);
	setEndDValues(y, m, d);

	dodateString();
}

function setEndDValues(y, m, d)
{
var now = new Date();
 
	if(document.addtimer.shour.selectedIndex > document.addtimer.ehour.selectedIndex)
	{
		now.setTime(0);   // Must init this to avoid end of month problems
		now.setFullYear(y);
		now.setMonth(m - 1);
		now.setDate(d+1);

		y = now.getFullYear();
		m = now.getMonth() + 1; // Should be 0-11
		d = now.getDate();
	}

	document.addtimer.eyear.selectedIndex = (y - getMinYear());
	document.addtimer.emonth.selectedIndex = (m-1);
	document.addtimer.eday.selectedIndex = (d-1);
}
