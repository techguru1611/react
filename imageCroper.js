import React, { Component } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import AvatarImageCropper from 'react-avatar-image-cropper';

export default class ImageCroper extends Component {

    constructor(props) {
        super(props);
    }

    apply = (file) => {
        console.log('file',file);
        var src = window.URL.createObjectURL(file);
        console.log('src', src);
        this.props.closeWindow('apply',file,src);
    }

    cancel = (type) => {
        console.log(type);
        this.props.closeWindow('cancel',null,null);
    }

    render() {
        return (
            <div style={{ width: '752px', height: '752px', margin: 'auto', border: '1px solid black' }} className="actual-img-block">
                <AvatarImageCropper apply={this.apply} cancel={this.cancel}/>
            </div>
        );
    }
}