import URI from "urijs";
import UrlJoin from "url-join";
import {CroppedIcon, ImageIcon, ToolTip} from "../../";
import React from "react";
import Image from "../icons/image.svg";
import PropTypes from "prop-types";

const PreviewIcon = ({fullUrl, baseFileUrl, imagePath, icon, onHover, additionalContent}) => {
  if(!imagePath) {
    return <div className="preview-icon"/>;
  }

  let uri = fullUrl || baseFileUrl || "";

  if(!fullUrl && baseFileUrl) {
    uri = URI(uri);
    uri.path(UrlJoin(uri.path(), imagePath).replace("//", "/"));
    uri = uri.toString();
  }

  return (
    <ToolTip
      key={`preview-icon-${imagePath}`}
      className={"-elv-file-image-preview-tooltip"}
      onMouseEnter={onHover}
      content={
        <React.Fragment>
          <CroppedIcon
            icon={uri}
            title={imagePath}
            className="file-image-preview"
          />
          { additionalContent }
        </React.Fragment>
      }
    >
      <ImageIcon
        icon={icon || Image}
        label={"Preview " + imagePath.split("/").pop()}
        className="preview-icon"
      />
    </ToolTip>
  );
};

PreviewIcon.propTypes = {
  fullUrl: PropTypes.string,
  baseFileUrl: PropTypes.string,
  imagePath: PropTypes.string.isRequired,
  onHover: PropTypes.func,
  additionalContent: PropTypes.element,
  icon: PropTypes.string
};

export default PreviewIcon;
