import "../stylesheets/browse.scss";

import React from "react";
import PropTypes from "prop-types";
import PrettyBytes from "pretty-bytes";
import DirectoryIcon from "../icons/directory.svg";
import FileIcon from "../icons/file.svg";
import {FileInfo} from "../utils/Files";
import Path from "path";
import {ImageIcon} from "./Icons";
import Action from "./Action";
import {Modal} from "../index";
import FileBrowser from "./FileBrowser";

// A styled browse widget for forms
class BrowseWidget extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileInfo: [],
      browseButtonRef: React.createRef(),
      previewUrl: "",
      browseModal: null
    };

    this.Preview = this.Preview.bind(this);
    this.HandleChange = this.HandleChange.bind(this);
    this.ActivateModal = this.ActivateModal.bind(this);
    this.SelectRemoteFiles = this.SelectRemoteFiles.bind(this);
    this.CloseModal = this.CloseModal.bind(this);
  }

  SelectRemoteFiles(fileInfo) {
    this.setState({fileInfo});
    this.props.onChange(fileInfo.map(info => info.path));
    this.CloseModal();
  }

  ActivateModal() {
    this.setState({
      browseModal: (
        <Modal className="-elv-browse-modal">
          <FileBrowser
            header={this.props.header}
            Submit={this.SelectRemoteFiles}
            Cancel={this.CloseModal}
            baseFileUrl={this.props.baseFileUrl}
            files={this.props.fileMetadata}
            mimeTypes={this.props.mimeTypes}
            extensions={this.props.extensions}
            multiple={this.props.multiple}
          />
        </Modal>
      )
    });
  }

  CloseModal() {
    this.setState({browseModal: null});
  }

  async HandlePreviewChange(file) {
    if(!this.props.preview || !file) { return; }
    const data = await new Response(file).blob();
    return window.URL.createObjectURL(data);
  }

  async HandleChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    const files = event.target.files || [];

    const fileInfo = await FileInfo("/", files, true);

    if(!this.props.directories || fileInfo.length === 0) {
      const previewUrl = await this.HandlePreviewChange(files[0]);

      this.setState({
        dirname: "",
        fileInfo,
        previewUrl
      });
    } else {
      // Format file info:
      // Directory information must be determined by looking at file paths
      // Only display top level directories
      let dirname = "";
      const files = {};
      fileInfo.forEach(file => {
        const parts = file.path.split(Path.sep);

        if(!dirname) { dirname = parts[0]; }

        if(parts.length > 2) {
          const dirInfo = files[parts[1]] || {};
          files[parts[1]] = {
            path: parts[1],
            type: "directory",
            size: (dirInfo.size || 0) + file.size
          };
        } else {
          files[parts[1]] = {
            ...file,
            path: parts[1]
          };
        }
      });

      this.setState({
        dirname,
        fileInfo: Object.values(files)
      });
    }

    this.props.onChange({
      target: {
        name,
        value,
        files
      }
    });
  }

  ItemRow(item) {
    const info = this.props.progress &&  this.props.progress[item.path] ?
      this.props.progress[item.path] : PrettyBytes(item.size || 0);
    return (
      <tr key={item.path}>
        <td className="-elv-item-icon">
          <ImageIcon icon={item.type === "directory" ? DirectoryIcon : FileIcon}/>
        </td>
        <td className="-elv-item-path">
          { item.path }
        </td>
        <td className="-elv-item-status">
          { info }
        </td>
      </tr>
    );
  }

  // Sort items - directory first, then case-insensitive alphabetical order
  SortedItems() {
    return (
      this.state.fileInfo
        .sort((item1, item2) => {
          if(item1.type !== item2.type) {
            if(item1.type === "directory") {
              return -1;
            } else {
              return 1;
            }
          } else {
            return item1.path.toLowerCase() > item2.path.toLowerCase();
          }
        })
        .map(file => this.ItemRow(file))
    );
  }

  FileSelections() {
    if(this.props.hideFileList || !this.state.fileInfo || this.state.fileInfo.length === 0) { return null; }

    return (
      <div className="-elv-browse-widget-files">
        <table>
          <thead>
            <tr>
              <th className="-elv-type-header" />
              <th>Name</th>
              <th className="-elv-size-header" />
            </tr>
          </thead>
          <tbody>
            { this.SortedItems() }
          </tbody>
        </table>
      </div>
    );
  }

  Preview() {
    if(!this.props.preview || !this.state.previewUrl) { return null; }

    return (
      <div className="-elv-image-preview">
        <img src={this.state.previewUrl}/>
      </div>
    );
  }

  RemoteBrowse() {
    return (
      <div className="-elv-browse-widget">
        <Action onClick={this.ActivateModal}>Browse</Action>
        { this.Preview() }
        { this.FileSelections() }
        { this.state.browseModal }
      </div>
    );
  }

  LocalBrowse() {
    const inputName = "browse-" + this.props.name;
    const accept = Array.isArray(this.props.accept) ? this.props.accept.join(", ") : this.props.accept;
    let directoryAttributes = {};
    if(this.props.directories) {
      directoryAttributes = {
        webkitdirectory: "true",
        mozdirectory: "true",
        msdirectory: "true",
        odirectory: "true",
        directory: "true"
      };
    }

    return (
      <div className="-elv-browse-widget">
        <input
          hidden={true}
          ref={this.state.browseButtonRef}
          name={inputName}
          type="file"
          required={this.props.required}
          multiple={this.props.multiple}
          accept={accept}
          onChange={this.HandleChange}
          {...directoryAttributes}
        />
        <Action onClick={() => this.state.browseButtonRef.current.click()}>Browse</Action>
        { this.Preview() }
        { this.FileSelections() }
      </div>
    );
  }

  render() {
    return this.props.remote ?
      this.RemoteBrowse() :
      this.LocalBrowse();
  }
}

BrowseWidget.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  multiple: PropTypes.bool,
  accept: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  preview: PropTypes.bool,
  hideFileList: PropTypes.bool,
  directories: PropTypes.bool,
  progress: PropTypes.object,


  header: PropTypes.string,
  remote: PropTypes.bool,
  fileMetadata: PropTypes.object,
  mimeTypes: PropTypes.object,
  baseFileUrl: PropTypes.string,
  extensions: PropTypes.arrayOf(
    PropTypes.string
  )
};

export default BrowseWidget;
