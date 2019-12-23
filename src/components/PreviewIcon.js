import URI from "urijs";
import UrlJoin from "url-join";
import {CroppedIcon, ImageIcon, ToolTip} from "../../";
import React from "react";
import Image from "../icons/image.svg";
import PropTypes from "prop-types";

const PreviewIcon = ({baseFileUrl, imagePath}) => {
  if (!imagePath) {
    return <div className="preview-icon"/>;
  }

  const uri = URI(baseFileUrl);
  uri.path(UrlJoin(uri.path(), imagePath).replace("//", "/"));

  return (
    <ToolTip
      key={`preview-icon-${imagePath}`}
      className={"file-image-preview-tooltip"}
      content={
        <CroppedIcon
          icon={uri.toString()}
          title={imagePath}
          className="file-image-preview"
        />
      }
    >
      <ImageIcon
        icon={Image}
        label={"Preview " + imagePath.split("/").pop()}
        className="preview-icon"
      />
    </ToolTip>
  );
};

PreviewIcon.propTypes = {
  baseFileUrl: PropTypes.string.isRequired,
  imagePath: PropTypes.string.isRequired
};

export default PreviewIcon;
