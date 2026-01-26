# Enhanced User Deletion Implementation

## Backend Changes

- [x] Add 'deactivated' field to User model
- [x] Modify user delete route to deactivate user and delete places
- [x] Update places creation to check user deactivation status
- [x] Update bookings creation to check user deactivation status
- [x] Update user profile routes to handle deactivated users

## Frontend Changes

- [x] Update AccProfile component to display deactivated profile message

## Testing

- [ ] Test user deactivation preserves bookings and reviews
- [ ] Test deactivated users cannot create new places
- [ ] Test deactivated users cannot create new bookings
- [ ] Test deactivated profiles display correctly
