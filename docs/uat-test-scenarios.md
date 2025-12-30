# User Acceptance Testing - Detailed Test Scenarios

## Test Scenario 1: New Student Registration and First Queue Request

### Objective
Test the complete flow from registration to first queue request for a new student user.

### Prerequisites
- Mobile app installed on test device
- Internet connection available
- Test environment is running

### Test Steps

#### Step 1: App Installation
1. Download the mobile app from the provided link
2. Install the app on the device
3. Open the app

**Expected Result**: App opens successfully, shows login/register screen

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 2: Registration
1. Tap "Register" or "Sign Up"
2. Fill in the registration form:
   - Email address
   - Password
   - First Name
   - Last Name
   - Student ID (optional)
   - Phone Number (optional)
3. Submit the form

**Expected Result**: 
- Registration form is clear and easy to fill
- Validation works (e.g., email format, password strength)
- Success message appears
- User is logged in automatically

**Actual Result**: _________________________

**Issues**: _________________________

**Time Taken**: _________________________

---

#### Step 3: Browse Services
1. After login, view the services list
2. Scroll through available services
3. Tap on a service to view details

**Expected Result**:
- Services list loads quickly
- Service information is clear
- Service details are helpful

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 4: Request Queue
1. Select a service (e.g., "Registrar")
2. Tap "Request Queue" or "Get Queue Number"
3. Confirm the request if prompted

**Expected Result**:
- Queue request is processed quickly
- Queue number is displayed clearly
- Queue position is shown
- Estimated wait time is displayed

**Actual Result**: _________________________

**Issues**: _________________________

**Queue Number Received**: _________________________

---

#### Step 5: View Queue Status
1. Navigate to "My Queue" or "Queue Status"
2. View current queue information
3. Check position and estimated wait time

**Expected Result**:
- Queue status is displayed clearly
- Position updates in real-time
- Information is accurate

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 6: Wait for Queue
1. Wait while queue is being processed
2. Monitor queue status updates
3. Wait for notification when queue is called

**Expected Result**:
- Status updates automatically
- Notification is received when called
- Notification is clear and helpful

**Actual Result**: _________________________

**Issues**: _________________________

**Time to Receive Notification**: _________________________

---

### Test Results Summary

**Overall Experience**: [ ] Excellent [ ] Good [ ] Fair [ ] Poor

**Main Issues Found**:
1. _________________________
2. _________________________
3. _________________________

**Suggestions**:
1. _________________________
2. _________________________
3. _________________________

---

## Test Scenario 2: Counter Staff Daily Operations

### Objective
Test the counter staff workflow for managing queues throughout a typical day.

### Prerequisites
- Web dashboard access
- Counter staff account credentials
- Assigned counter(s)

### Test Steps

#### Step 1: Login
1. Open web dashboard URL
2. Enter credentials
3. Click "Login"

**Expected Result**: Login successful, redirected to dashboard

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 2: View Assigned Counters
1. Navigate to "My Counters" or dashboard
2. View list of assigned counters
3. Check counter status

**Expected Result**:
- Counters are clearly listed
- Status is visible
- Information is accurate

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 3: Set Counter Status
1. Select a counter
2. Set status to "Available" or "Open"
3. Confirm status change

**Expected Result**:
- Status changes successfully
- Status is clearly displayed
- Change is immediate

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 4: Call Next Queue
1. View current queue for the service
2. Click "Call Next" button
3. Confirm the action

**Expected Result**:
- Next queue number is called
- Queue number is displayed prominently
- Notification is sent to student
- Queue status updates

**Actual Result**: _________________________

**Issues**: _________________________

**Queue Number Called**: _________________________

---

#### Step 5: Start Serving
1. After calling a queue, click "Start Serving"
2. Confirm customer has arrived
3. Begin service

**Expected Result**:
- Service status changes to "Serving"
- Counter status updates
- Time tracking begins

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 6: Complete Service
1. After service is complete, click "Complete" or "Finish"
2. Confirm completion
3. View next queue

**Expected Result**:
- Service is marked as complete
- Queue is removed from active list
- Next queue is ready to be called
- Statistics update

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 7: View Statistics
1. Navigate to counter statistics
2. View today's statistics:
   - Number of customers served
   - Average service time
   - Queue wait times

**Expected Result**:
- Statistics are displayed clearly
- Data is accurate
- Information is useful

**Actual Result**: _________________________

**Issues**: _________________________

---

### Test Results Summary

**Overall Experience**: [ ] Excellent [ ] Good [ ] Fair [ ] Poor

**Workflow Efficiency**: [ ] Very Efficient [ ] Efficient [ ] Acceptable [ ] Inefficient

**Main Issues Found**:
1. _________________________
2. _________________________
3. _________________________

**Suggestions**:
1. _________________________
2. _________________________
3. _________________________

---

## Test Scenario 3: Admin Service Management

### Objective
Test admin capabilities for creating, editing, and managing services.

### Prerequisites
- Admin account credentials
- Web dashboard access

### Test Steps

#### Step 1: Login as Admin
1. Open admin dashboard
2. Enter admin credentials
3. Login

**Expected Result**: Login successful, admin dashboard displayed

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 2: View All Services
1. Navigate to "Services" section
2. View list of all services
3. Check service details

**Expected Result**:
- All services are listed
- Information is complete
- List is easy to navigate

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 3: Create New Service
1. Click "Add Service" or "Create Service"
2. Fill in service form:
   - Service Name
   - Description
   - Location
   - Estimated Service Time
   - Max Queue Size
   - Operating Hours
3. Submit form

**Expected Result**:
- Form is clear and easy to fill
- Validation works correctly
- Service is created successfully
- Service appears in list

**Actual Result**: _________________________

**Issues**: _________________________

**Service Created**: _________________________

---

#### Step 4: Edit Existing Service
1. Select a service from the list
2. Click "Edit"
3. Modify service details
4. Save changes

**Expected Result**:
- Changes are saved successfully
- Updated information displays correctly
- Changes are reflected immediately

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 5: Manage Service Counters
1. Select a service
2. View assigned counters
3. Add a new counter
4. Edit counter details
5. Remove a counter (if needed)

**Expected Result**:
- Counter management is intuitive
- All operations work correctly
- Changes are saved

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 6: View Service Analytics
1. Navigate to service analytics
2. View statistics:
   - Total queues today
   - Average wait time
   - Peak hours
   - Completion rate

**Expected Result**:
- Analytics are displayed clearly
- Data is accurate
- Charts/graphs are helpful

**Actual Result**: _________________________

**Issues**: _________________________

---

### Test Results Summary

**Overall Experience**: [ ] Excellent [ ] Good [ ] Fair [ ] Poor

**Ease of Management**: [ ] Very Easy [ ] Easy [ ] Moderate [ ] Difficult

**Main Issues Found**:
1. _________________________
2. _________________________
3. _________________________

**Suggestions**:
1. _________________________
2. _________________________
3. _________________________

---

## Test Scenario 4: Queue Cancellation Flow

### Objective
Test the queue cancellation process from student perspective.

### Prerequisites
- Student account with active queue
- Mobile app access

### Test Steps

#### Step 1: View Active Queue
1. Login to mobile app
2. Navigate to "My Queue" or "Queue Status"
3. View active queue details

**Expected Result**: Active queue is displayed with all details

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 2: Initiate Cancellation
1. Find "Cancel Queue" option
2. Tap to cancel
3. Review cancellation confirmation

**Expected Result**:
- Cancel option is easy to find
- Confirmation dialog appears
- Confirmation message is clear

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 3: Confirm Cancellation
1. Read confirmation message
2. Confirm cancellation
3. Wait for confirmation

**Expected Result**:
- Cancellation is processed
- Success message appears
- Queue is removed from active list

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 4: Verify Cancellation
1. Check queue status
2. Verify queue is no longer active
3. Check if position updates for other users

**Expected Result**:
- Queue is cancelled successfully
- Status updates correctly
- Other users' positions update

**Actual Result**: _________________________

**Issues**: _________________________

---

### Test Results Summary

**Overall Experience**: [ ] Excellent [ ] Good [ ] Fair [ ] Poor

**Ease of Cancellation**: [ ] Very Easy [ ] Easy [ ] Moderate [ ] Difficult

**Main Issues Found**:
1. _________________________
2. _________________________
3. _________________________

**Suggestions**:
1. _________________________
2. _________________________
3. _________________________

---

## Test Scenario 5: Display Board (TV Screen)

### Objective
Test the display board functionality for projecting queue information.

### Prerequisites
- Display board URL
- Large screen or projector
- Admin access to configure

### Test Steps

#### Step 1: Access Display Board
1. Open display board URL
2. View initial display

**Expected Result**: Display board loads and shows queue information

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 2: View Current Serving
1. Check "Currently Serving" section
2. Verify queue numbers are displayed
3. Check service names

**Expected Result**:
- Information is clearly visible
- Text is large enough
- Colors are appropriate

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 3: View Waiting Queues
1. Check "Next in Line" section
2. Verify queue numbers
3. Check waiting counts

**Expected Result**:
- Information is organized
- Easy to read from distance
- Updates automatically

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 4: Test Fullscreen Mode
1. Enter fullscreen mode
2. Verify display fills screen
3. Exit fullscreen

**Expected Result**:
- Fullscreen works correctly
- Display is optimized for large screen
- Easy to exit

**Actual Result**: _________________________

**Issues**: _________________________

---

#### Step 5: Verify Auto-Refresh
1. Observe display for 1-2 minutes
2. Make a queue change (from another device)
3. Verify display updates automatically

**Expected Result**:
- Display updates automatically
- Updates are smooth
- No flickering or glitches

**Actual Result**: _________________________

**Issues**: _________________________

**Refresh Interval**: _________________________

---

### Test Results Summary

**Overall Experience**: [ ] Excellent [ ] Good [ ] Fair [ ] Poor

**Readability**: [ ] Excellent [ ] Good [ ] Fair [ ] Poor

**Main Issues Found**:
1. _________________________
2. _________________________
3. _________________________

**Suggestions**:
1. _________________________
2. _________________________
3. _________________________

---

## General Test Notes

**Test Date**: _________________________  
**Tester Name**: _________________________  
**Test Environment**: _________________________  
**Browser/Device**: _________________________  
**Network**: _________________________

**Overall System Rating**: [ ] 5 [ ] 4 [ ] 3 [ ] 2 [ ] 1

**Would you use this system?**: [ ] Yes [ ] No [ ] Maybe

**Additional Comments**:
_________________________________________________  
_________________________________________________  
_________________________________________________

