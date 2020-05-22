import ProfileView from './ProfileView';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { myProfile, countiesList, saveProfile, stripeTokenVerification, updateStripeAccount, getStripeProfileSuccess, handleProfileDialogVisibility } from '../../services/profile';

/**
 * Avails State to ProfileView
*/
const mapStateToProps = state => ({
    userDetails: state.profile.userDetails,
    profileErrorgMsg: state.profile.profileErrorgMsg,
    saveUserSuccessMsg: state.profile.saveUserSuccessMsg,
    saveUserErrorMsg: state.profile.saveUserErrorMsg,
    counties: state.profile.countiesList,
    countiesErrorMsg: state.profile.countiesErrorgMsg,
    stripeProfileErrorgMsg: state.profile.stripeProfileErrorgMsg,
    stripeProfileSuccessgMsg: state.profile.stripeProfileSuccessgMsg,
    loaderVisibility: state.auth.loaderVisibility,
    dialogVisibility: state.profile.dialogVisibility
});

/**
 * Maps dispatch and action ceators to ProfileView
 */
const mapDispatchToProps = dispatch => bindActionCreators({
    myProfile,
    countiesList,
    saveProfile,
    stripeTokenVerification,
    updateStripeAccount,
    getStripeProfileSuccess,
    handleProfileDialogVisibility
}, dispatch);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProfileView);

