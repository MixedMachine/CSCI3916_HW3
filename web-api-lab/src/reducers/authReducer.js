import constants from '../constants/actionTypes';

let initialState = {
    loggedIn: localStorage.getItem('token') ? true : false,
    username: localStorage.getItem('username') ? localStorage.getItem('username') : ""
};

const authReducer = (state = initialState, action) => {

    let updated = Object.assign({}, state);

    switch (action.type) {
        case constants.USER_LOGGEDIN:
            updated['loggedIn'] = true;
            updated['username'] = action.username;
            return updated;

        case constants.USER_LOGOUT:
            updated['loggedIn'] = false;
            updated['username'] = "";
            return updated;

        default:
            return state;
    }
}

export default authReducer;