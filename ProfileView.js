import React, { Component } from 'react';  //eslint-disable-line
import { Grid, Row, Col } from 'react-flexbox-grid';
import './ProfileView.css'; // ProfileView page css
import * as apiconfig from '../../services/apiConfig';
import { getUrlParam } from '../../utils/commonFunction';
import Spinner from '../../component/spinner/Spinner';
import { WithContext as ReactTags } from 'react-tag-input';
import { TextField, FlatButton } from 'material-ui';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DatePicker from 'material-ui/DatePicker';
import DialogView from '../../component/dialog/DialogView';
import ImageCroper from './imageCroper';

const KeyCodes = {
    comma: 188,
    enter: 13,
};

const educationItems = [
    <MenuItem key={1} value="bachelors_completed" primaryText="Bachelors Completed" />,
    <MenuItem key={2} value="current_masters" primaryText="Current Masters" />,
    <MenuItem key={3} value="undergraduate" primaryText="Undergraduate" />,
    <MenuItem key={4} value="education_professional_degree" primaryText="Education Professional Degree" />,
    <MenuItem key={5} value="masters_completed" primaryText="Masters Completed" />,
    <MenuItem key={6} value="none" primaryText="None" />,
    <MenuItem key={7} value="phd_candidate" primaryText="PHD Candidate" />,
    <MenuItem key={8} value="phd_complete" primaryText="PHD Complete" />,
];

const delimiters = [KeyCodes.comma, KeyCodes.enter];

class ProfileView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tags: [],
            fields: {},
            errors: {},
            formIsValid: false,
            file: '',
            imagePreviewUrl: '',
            isMpdalOpen: false
        };
    }

    componentDidMount() {
        this.props.myProfile();
        this.props.countiesList();
        // If we get stripe token from url then we need to take code and send to api
        if (this.props.location.search || this.props.location.search !== '') {
            const apiParam = getUrlParam(this.props.location.search);
            if (apiParam.code) {
                this.props.stripeTokenVerification(apiParam.code);
            }
            if (apiParam.isUpdated) {
                this.props.getStripeProfileSuccess('Your stripe profile is updated successfully');
            }
        }
    }

    componentWillReceiveProps(newProps) {

        if (Object.keys(newProps.userDetails).length > 0) {
            console.log("UserProfile:", newProps);
            const { name, phone_no, email, city, address1, address2, counties, state, zipcode, allergies,
                blob, education_subject, languages, education_place, fav_book, education, cpr_experience, date_of_birth, drive_w_children, experience_from_age } = newProps.userDetails;
            let fields = {
                "name": name,
                "email": email,
                "phone_no": phone_no,
                "address1": address1,
                "address2": address2,
                "city": city,
                "state": state,
                "zipcode": zipcode,
                "allergies": allergies,
                "blob": blob,
                "education_subject": education_subject,
                "languages": languages,
                "education_place": education_place,
                "fav_book": fav_book,
                "education": education,
                "cpr_experience": cpr_experience,
                "date_of_birth": date_of_birth,
                "drive_w_children": drive_w_children,
                "experience_from_age": experience_from_age
            }
            let tags = counties.map((countie) => {
                return {
                    id: countie.name,
                    text: countie.name,
                    value: countie.id,
                    postal_code: countie.postal_code
                }
            });
            this.setState({ fields: fields });
            this.setState({ tags: tags });
            this.handleValidationAll();
        }
    }

    /**
    * Check Update Stripe Account
    */
    updateStripeAccount() {
        this.props.updateStripeAccount();
    }

    handleDelete = (i) => {
        const { tags } = this.state;
        this.setState({
            tags: tags.filter((tag, index) => index !== i),
        });
    }

    handleAddition = (tag) => {
        this.setState(state => ({ tags: [...state.tags, tag] }));
    }

    handleDrag = (tag, currPos, newPos) => {
        const tags = [...this.state.tags];
        const newTags = tags.slice();

        newTags.splice(currPos, 1);
        newTags.splice(newPos, 0, tag);

        // re-render
        this.setState({ tags: newTags });
    }

    handleTagClick = (index) => {
        console.log('The tag at index ' + index + ' was clicked');
    }

    /**
     * Handle multiple form feild and set feilds value
     * @memberof ProfileView
     */
    handleChange = (value, field) => {
        let fields = this.state.fields;
        fields[field] = value;
        this.setState({ fields });
        this.handleValidation(field);
        this.handleValidationAll();
    }

    handleEducationChange = (event, index, value) => {
        console.log(event.target.name);
        let fields = this.state.fields;
        fields['education'] = value;
        this.setState({ fields });
        this.handleValidation('education');
        this.handleValidationAll();
    }

    handleExperienceChange = (event, index, value) => {
        let fields = this.state.fields;
        fields['cpr_experience'] = value;
        this.setState({ fields });
        this.handleValidation('cpr_experience');
        this.handleValidationAll();
    }

    handleDriveChildrenChange = (event, index, value) => {
        let fields = this.state.fields;
        fields['drive_w_children'] = value;
        this.setState({ fields });
        this.handleValidation('drive_w_children');
        this.handleValidationAll();
    }

    handleExperienceAgeChange = (event, index, value) => {
        let fields = this.state.fields;
        fields['experience_from_age'] = value;
        this.setState({ fields });
        this.handleValidation('experience_from_age');
        this.handleValidationAll();
    }

    /**
     * Validate realtime form feild
     * @param {*} field 
     */
    handleValidation(field) {
        let fields = this.state.fields;
        let errors = this.state.errors;

        switch (field) {
            case 'name':
            case "phone_no":
            case "address1":
            // case "address2":
            case "city":
            case "state":
            case "zipcode":
            // case "allergies":
            // case "blob":
            // case "education_subject":
            // case "languages":
            // case "education_place":
            // case "fav_book":
            // case "education":
            case "cpr_experience":
            case "date_of_birth":
            case "drive_w_children":
            case "experience_from_age":
                if (typeof fields[field] !== "undefined") {
                    if (fields[field] === '') {
                        errors[field] = "*Required";
                    } else {
                        errors[field] = "";
                    }
                }
                this.setState({ errors: errors });
                break;
            default:
                break;
        }
    }

    /**
     * For validate all form feilds
     * @memberof ProfileView
     */
    handleValidationAll() {
        let fields = this.state.fields;
        let formIsValid = true;

        if (!fields["name"]) {
            formIsValid = false;
        }

        if (!fields["phone_no"]) {
            formIsValid = false;
        }


        if (!fields["address1"]) {
            formIsValid = false;
        }

        if (!fields["address2"]) {
            formIsValid = true;
        }

        if (!fields["city"]) {
            formIsValid = false;
        }

        if (!fields["state"]) {
            formIsValid = false;
        }

        if (!fields["zipcode"]) {
            formIsValid = false;
        }

        if (!fields["allergies"]) {
            formIsValid = true;
        }

        if (!fields["blob"]) {
            formIsValid = true;
        }

        if (!fields["education_subject"]) {
            formIsValid = true;
        }

        if (!fields["languages"]) {
            formIsValid = true;
        }

        if (!fields["education_place"]) {
            formIsValid = true;
        }

        if (!fields["fav_book"]) {
            formIsValid = true;
        }

        if (!fields["education"]) {
            formIsValid = true;
        }

        if (!fields["cpr_experience"]) {
            formIsValid = false;
        }

        if (!fields["date_of_birth"]) {
            formIsValid = false;
        }

        if (!fields["drive_w_children"]) {
            formIsValid = false;
        }

        if (!fields["experience_from_age"]) {
            formIsValid = false;
        }

        this.setState({ formIsValid: formIsValid });
    }

    handleImageChange(e) {
        e.preventDefault();

        let reader = new FileReader();
        let file = e.target.files[0];

        if (file !== undefined) {
            reader.onloadend = () => {
                this.setState({
                    file: file,
                    imagePreviewUrl: reader.result,
                    isMpdalOpen: true
                });
            }
            reader.readAsDataURL(file);
            // this.props.handleProfileDialogVisibility(true);
        } else {
            this.setState({
                file: '',
                imagePreviewUrl: ''
            });
        }
    }

    openImageCroperDialog = () => {
        let action = [];
        return (
            <DialogView
                actions={action}
                handleDialogVisibility={() => this.setState({isMpdalOpen:false})}
                dialogVisibility={this.state.isMpdalOpen}
                className="sorryModal sorry-modal-block image-croping-modal"
            >
                <ImageCroper closeWindow={(fromWhere,file,imagePreviewUrl) => {
                    if (fromWhere === 'apply') {
                        this.setState({
                            file: file,
                            imagePreviewUrl: imagePreviewUrl,
                            isMpdalOpen: false
                        });
                    } else {
                        this.setState({
                            file: '',
                            imagePreviewUrl: '',
                            isMpdalOpen: false
                        });
                    }
                }}/>
            </ DialogView>
        );
    }

    saveProfileData() {
        if (this.state.formIsValid) {
            let data = this.state.fields;
            console.log("Data:", data);
            data['counties'] = this.state.tags.map(x => {
                return x.value
            }).join(',');

            if (this.state.file) {
                data['sitter_image'] = this.state.file
            }

            var formData = new FormData();

            Object.keys(data).map(x => {
                formData.append(x, data[x]);
            });
            this.props.saveProfile(formData);
        }
    }

    /**
   * Render Dialog
   * @return {JSX} Rendered Dialog
   */
    renderDialog = (title,errMessage) => {
        let action = [];
        let dialogboxContain = '';
        action = [
            <FlatButton
                className="cancelBtn"
                label="Ok"
                primary={true}
                onClick={() => { this.props.handleProfileDialogVisibility(false); }}
            />
        ];
        dialogboxContain = <div className="sorryModalCont sorry-modal">
            <h3>{title}</h3>
            <h4>{errMessage}</h4>
        </div>;
        return (
            <DialogView
                actions={action}
                handleDialogVisibility={this.props.handleProfileDialogVisibility.bind(false)}
                dialogVisibility={this.props.dialogVisibility}
                className="sorryModal sorry-modal-block"
            >
                {dialogboxContain}
            </ DialogView>
        );
    }

    /**
    * Render ProfileView
    * @return {JSX} Rendered Sitter Profile View
    */
    render() {
        let { tags, imagePreviewUrl } = this.state;
        let { picture_url, stripe_account_id } = this.props.userDetails;
        console.log("Test:", this.props.userDetails);
        const stripeURL = `${apiconfig.stripeOauthURI}?redirect_uri=${apiconfig.stripeRedirectURI}&client_id=${apiconfig.stripeClientId}`;

        let imagePreview = null;
        if (imagePreviewUrl) {
            picture_url = '';
            imagePreview = (<img src={imagePreviewUrl} alt="banner" />);
        } else {
            imagePreview = (<img src={require('../../images/user.png')} alt="banner" />);
        }

        let suggestions = [];
        if (this.props.counties.length > 0) {
            suggestions = this.props.counties.map((countie) => {
                return {
                    id: countie.name,
                    text: countie.name,
                    value: countie.id,
                    postal_code: countie.postal_code
                }
            });
        }
        return (
            <div className="profileView">
                <Spinner isVisible={this.props.loaderVisibility} />
                {this.state.isMpdalOpen && this.openImageCroperDialog()}
                {this.props.stripeProfileErrorgMsg && this.renderDialog('Error',this.props.stripeProfileErrorgMsg)}
                {this.props.stripeProfileSuccessgMsg && this.renderDialog('Success',this.props.stripeProfileSuccessgMsg)}
                {this.props.saveUserSuccessMsg && this.renderDialog('Success',this.props.saveUserSuccessMsg)}
                {this.props.saveUserErrorMsg && this.renderDialog('Error',this.props.saveUserErrorMsg)}
                <Grid>
                    {
                        this.props.profileErrorgMsg ? this.props.profileErrorgMsg
                            : <div>
                                <Row className="pos-rel">
                                    <Col xs={12} sm={12}>
                                        <div className="profilePhotoView">
                                            <div className="profilePhoto">
                                                {

                                                    picture_url ?
                                                        <img src={picture_url} alt="banner" />
                                                        : imagePreview
                                                }
                                                {
                                                    // <span className="input-icon">
                                                    //     <span className="camera-icon"><i className="fa fa-camera"></i></span>
                                                    //     <input className="fileInput" type="file" onChange={(e) => this.handleImageChange(e)} accept="image/x-png,image/gif,image/jpeg" />
                                                    // </span>

                                                    <span className="input-icon">
                                                        <span className="camera-icon" onClick={() => this.setState({isMpdalOpen: true})}><i className="fa fa-camera"></i></span>
                                                    </span>
                                                }
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={6}>
                                        <div className="connectStripeView connetStripebtn updateStgripe-btn">
                                            {stripe_account_id
                                                ? <a className="connectStripe" onClick={() => { this.updateStripeAccount(); }}>Update Stripe</a>
                                                : <a className="connectStripe" href={stripeURL}>Connect Stripe</a>
                                            }

                                        </div>
                                    </Col>
                                </Row>
                                <div className="profileTitle">
                                    <h1>Personal Profile</h1>
                                </div>
                                <div className="profileFormView">
                                    <Row>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Name</h4>
                                                <div className="showDataView">
                                                    <TextField
                                                        className="form-control form-feild"
                                                        argin="normal"
                                                        type="text"
                                                        placeholder="Name"
                                                        value={this.state.fields["name"]}
                                                        onChange={(e) => { this.handleChange(e.target.value, 'name'); }}
                                                    />
                                                    <span className="error">{this.state.errors["name"]}</span>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Email</h4>
                                                <div className="showDataView disabled">
                                                    <TextField
                                                        className="form-control form-feild"
                                                        argin="normal"
                                                        type="text"
                                                        placeholder="Email"
                                                        disabled
                                                        value={this.state.fields["email"]}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Phone No.</h4>
                                                <div className="showDataView">
                                                    <TextField
                                                        className="form-control form-feild"
                                                        argin="normal"
                                                        type="text"
                                                        placeholder="Phone No."
                                                        value={this.state.fields["phone_no"]}
                                                        onChange={(e) => { this.handleChange(e.target.value, 'phone_no'); }}
                                                    />
                                                    <span className="error">{this.state.errors["phone_no"]}</span>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Address</h4>
                                                <div className="showDataView">
                                                    <TextField
                                                        className="form-control form-feild"
                                                        argin="normal"
                                                        type="text"
                                                        placeholder="Address"
                                                        value={this.state.fields["address1"]}
                                                        onChange={(e) => { this.handleChange(e.target.value, 'address1'); }}
                                                    />
                                                    <span className="error">{this.state.errors["address1"]}</span>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Locality</h4>
                                                <div className="showDataView">
                                                    <TextField
                                                        className="form-control form-feild"
                                                        argin="normal"
                                                        type="text"
                                                        placeholder="Locality"
                                                        value={this.state.fields["address2"]}
                                                        onChange={(e) => { this.handleChange(e.target.value, 'address2'); }}
                                                    />
                                                    <span className="error">{this.state.errors["address2"]}</span>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>City</h4>
                                                <div className="showDataView">
                                                    <TextField
                                                        className="form-control form-feild"
                                                        argin="normal"
                                                        type="text"
                                                        placeholder="City"
                                                        value={this.state.fields["city"]}
                                                        onChange={(e) => { this.handleChange(e.target.value, 'city'); }}
                                                    />
                                                    <span className="error">{this.state.errors["city"]}</span>
                                                </div>
                                            </div>

                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Zipcode</h4>
                                                <div className="showDataView">
                                                    <TextField
                                                        className="form-control form-feild"
                                                        argin="normal"
                                                        type="text"
                                                        placeholder="Zipcode"
                                                        value={this.state.fields["zipcode"]}
                                                        onChange={(e) => { this.handleChange(e.target.value, 'zipcode'); }}
                                                    />
                                                    <span className="error">{this.state.errors["zipcode"]}</span>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>State</h4>
                                                <div className="showDataView">
                                                    <TextField
                                                        className="form-control form-feild"
                                                        argin="normal"
                                                        type="text"
                                                        placeholder="State"
                                                        value={this.state.fields["state"]}
                                                        onChange={(e) => { this.handleChange(e.target.value, 'state'); }}
                                                    />
                                                    <span className="error">{this.state.errors["state"]}</span>
                                                </div>
                                            </div>

                                        </Col>

                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Allergies</h4>
                                                <div className="showDataView">
                                                    <TextField
                                                        className="form-control form-feild"
                                                        argin="normal"
                                                        type="text"
                                                        placeholder="Allergies"
                                                        value={this.state.fields["allergies"]}
                                                        onChange={(e) => { this.handleChange(e.target.value, 'allergies'); }}
                                                    />
                                                    <span className="error">{this.state.errors["allergies"]}</span>
                                                </div>
                                            </div>

                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Blob</h4>
                                                <div className="showDataView">
                                                    <TextField
                                                        className="form-control form-feild"
                                                        argin="normal"
                                                        type="text"
                                                        placeholder="blob"
                                                        value={this.state.fields["blob"]}
                                                        onChange={(e) => { this.handleChange(e.target.value, 'blob'); }}
                                                    />
                                                    <span className="error">{this.state.errors["allergies"]}</span>
                                                </div>
                                            </div>

                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Education Subject</h4>
                                                <div className="showDataView">
                                                    <TextField
                                                        className="form-control form-feild"
                                                        argin="normal"
                                                        type="text"
                                                        placeholder="Education Subject"
                                                        value={this.state.fields["education_subject"]}
                                                        onChange={(e) => { this.handleChange(e.target.value, 'education_subject'); }}
                                                    />
                                                    <span className="error">{this.state.errors["education_subject"]}</span>
                                                </div>
                                            </div>

                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Languages</h4>
                                                <div className="showDataView">
                                                    <TextField
                                                        className="form-control form-feild"
                                                        argin="normal"
                                                        type="text"
                                                        placeholder="Languages"
                                                        value={this.state.fields["languages"]}
                                                        onChange={(e) => { this.handleChange(e.target.value, 'languages'); }}
                                                    />
                                                    <span className="error">{this.state.errors["languages"]}</span>
                                                </div>
                                            </div>

                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Education Place</h4>
                                                <div className="showDataView">
                                                    <TextField
                                                        className="form-control form-feild"
                                                        argin="normal"
                                                        type="text"
                                                        placeholder="Education Place"
                                                        value={this.state.fields["education_place"]}
                                                        onChange={(e) => { this.handleChange(e.target.value, 'education_place'); }}
                                                    />
                                                    <span className="error">{this.state.errors["education_place"]}</span>
                                                </div>
                                            </div>

                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Favourite Book</h4>
                                                <div className="showDataView">
                                                    <TextField
                                                        className="form-control form-feild"
                                                        argin="normal"
                                                        type="text"
                                                        placeholder="Favourite book"
                                                        value={this.state.fields["fav_book"]}
                                                        onChange={(e) => { this.handleChange(e.target.value, 'fav_book'); }}
                                                    />
                                                    <span className="error">{this.state.errors["fav_book"]}</span>
                                                </div>
                                            </div>

                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Education</h4>
                                                <div className="showDataView">
                                                    <SelectField
                                                        className="form-control form-feild"
                                                        value={this.state.fields["education"]}
                                                        onChange={this.handleEducationChange}
                                                        // style={styles.customWidth}
                                                        // menuItemStyle={color.red}
                                                        selectedMenuItemStyle={{ backgroundColor: '##FE6B61', color: '#FE6B61' }}
                                                    >
                                                        {educationItems}
                                                    </SelectField>
                                                    <span className="error">{this.state.errors["education"]}</span>
                                                </div>
                                            </div>

                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Experience With CPR</h4>
                                                <div className="showDataView">
                                                    <SelectField
                                                        className="form-control form-feild"
                                                        value={this.state.fields["cpr_experience"]}
                                                        onChange={this.handleExperienceChange}
                                                        selectedMenuItemStyle={{ backgroundColor: '##FE6B61', color: '#FE6B61' }}
                                                    >
                                                        <MenuItem value="yes" primaryText="Yes" />
                                                        <MenuItem value="no" primaryText="No" />
                                                    </SelectField>
                                                    <span className="error">{this.state.errors["cpr_experience"]}</span>
                                                </div>
                                            </div>

                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Date Of Birth</h4>
                                                <div className="showDataView">
                                                    <TextField
                                                        className="form-control form-feild"
                                                        argin="normal"
                                                        type="date"
                                                        placeholder="Date of Birth"
                                                        value={this.state.fields["date_of_birth"]}
                                                        onChange={(e) => { this.handleChange(e.target.value, 'date_of_birth'); }}
                                                    />
                                                    <span className="error">{this.state.errors["date_of_birth"]}</span>
                                                </div>
                                            </div>

                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Drives With Children</h4>
                                                <div className="showDataView">
                                                    <SelectField
                                                        className="form-control form-feild"
                                                        value={this.state.fields["drive_w_children"]}
                                                        onChange={this.handleDriveChildrenChange}
                                                        selectedMenuItemStyle={{ backgroundColor: '##FE6B61', color: '#FE6B61' }}
                                                    >
                                                        <MenuItem value="yes" primaryText="Yes" />
                                                        <MenuItem value="no" primaryText="No" />
                                                    </SelectField>
                                                    <span className="error">{this.state.errors["drive_w_children"]}</span>
                                                </div>
                                            </div>

                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <div className="profileLabel">
                                                <h4>Experience From Age</h4>
                                                <div className="showDataView">
                                                    <SelectField
                                                        className="form-control form-feild"
                                                        value={this.state.fields["experience_from_age"]}
                                                        onChange={this.handleExperienceAgeChange}
                                                        selectedMenuItemStyle={{ backgroundColor: '##FE6B61', color: '#FE6B61' }}
                                                    >
                                                        <MenuItem value={0} primaryText="0" />
                                                        <MenuItem value={1} primaryText="1" />
                                                        <MenuItem value={2} primaryText="2" />
                                                        <MenuItem value={3} primaryText="3" />
                                                        <MenuItem value={4} primaryText="4" />
                                                        <MenuItem value={5} primaryText="5" />
                                                        <MenuItem value={6} primaryText="6" />
                                                        <MenuItem value={7} primaryText="7" />
                                                        <MenuItem value={8} primaryText="8" />
                                                        <MenuItem value={9} primaryText="9" />
                                                        <MenuItem value={10} primaryText="10" />
                                                        <MenuItem value={11} primaryText="11" />
                                                        <MenuItem value={12} primaryText="12" />
                                                        <MenuItem value={13} primaryText="13" />
                                                        <MenuItem value={14} primaryText="14" />
                                                        <MenuItem value={15} primaryText="15" />
                                                        <MenuItem value={16} primaryText="16" />
                                                        <MenuItem value={17} primaryText="17" />
                                                    </SelectField>
                                                    <span className="error">{this.state.errors["experience_from_age"]}</span>
                                                </div>
                                            </div>

                                        </Col>
                                        <Col xs={12} sm={12}>
                                            <div className="profileLabel">
                                                <h4>Select Available Counties</h4>
                                                <div className="showDataView">
                                                    <ReactTags
                                                        tags={tags}
                                                        suggestions={suggestions}
                                                        placeholder="Add new county"
                                                        delimiters={delimiters}
                                                        handleDelete={this.handleDelete}
                                                        handleAddition={this.handleAddition}
                                                        handleDrag={this.handleDrag}
                                                        handleTagClick={this.handleTagClick}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={12} sm={12} md={12} lg={12}>
                                            <div className="connectStripeView">
                                                {
                                                    <a className="connectStripe" disabled={!this.state.formIsValid} onClick={() => { this.saveProfileData(); }}>Save Profile</a>
                                                }

                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                    }
                </Grid>
            </div >
        );
    }
}
export default ProfileView;
