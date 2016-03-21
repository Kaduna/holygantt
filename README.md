# HolyGantt: JavaScript Gantt/timetable
Welcome to HolyGantt :-) With HolyGantt you can create a gantt or timetable easily. Check below for a demo. <br />
Tip: try to move or resize the blocks in the timetable.
# Disclaimer
This project needs some cleanup / improvements in code. Use at own risk.
# Demo
See the demo here.
# Installation
1. First, include jQuery and jQuery UI on the page where you use HolyGantt
2. Add holygantt.js and holygantt.css
3. Add the following at the end of your body:
    ```javascript
    $("#gantt").gantt({
                            data: 'data.json',
                            tdInterval: 30,
                            mode: 'edit',
                            resizeInterval: 15,
                            changed: function(info) {

                      }
                      })
    ```
  Data points to a JSON file or URL with the shifts.

# Need help?
Email me at tom .. holyticket .. com.
