import "../stylesheets/file-browser.scss";

import React from "react";
import PropTypes from "prop-types";
import PrettyBytes from "pretty-bytes";
import UrlJoin from "url-join";
import Path from "path";
import {Action, IconButton, ImageIcon, onEnterPressed} from "../..";
import PreviewIcon from "./PreviewIcon";

import DirectoryIcon from "../icons/directory.svg";
import FileIcon from "../icons/file.svg";
import BackIcon from "../icons/directory_back.svg";

class FileBrowser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      path: ".",
      displayPath: "/",
      showUpload: false,
      selected: {}
    };
  }

  Select(filename, size) {
    if(this.state.selected[filename]) {
      let selected = this.state.selected;
      delete selected[filename];
      this.setState({selected});
    } else {
      this.setState({
        selected: {
          ...(this.props.multiple ? this.state.selected : {}),
          [filename]: {
            type: "file",
            path: UrlJoin(this.state.path, filename).replace(/^\.\//, ""),
            size
          }
        }
      });
    }
  }

  CurrentDirectory() {
    let files = this.props.files || {};

    if(this.state.path === ".") {
      return files;
    }

    this.state.path
      .replace("./", "")
      .split("/")
      .forEach(directory => files = files[directory]);

    return files;
  }

  ChangeDirectory(dirname) {
    dirname = Path.normalize(dirname);

    this.setState({
      path: dirname,
      displayPath: dirname === "." ? "/" : "/" + dirname,
      selected: {}
    });
  }

  FileIcon(name) {
    const extension = name.split(".").pop();
    const mimeType = (this.props.mimeTypes || {})[extension] || "";
    const isImage =
      mimeType.startsWith("image") ||
      ["apng", "gif", "jpg", "jpeg", "png", "svg", "tif", "tiff", "webp"].includes(extension);

    if(!isImage) {
      return <ImageIcon icon={FileIcon} label="File"/>;
    }

    return (
      <PreviewIcon
        imagePath={UrlJoin(this.state.path, name)}
        baseFileUrl={this.props.baseFileUrl}
      />
    );
  }

  File(name, info) {
    if(this.props.extensions && this.props.extensions.length > 0) {
      if(!this.props.extensions.includes(name.split(".").pop())) {
        return;
      }
    }

    const size = PrettyBytes(info.size || 0);
    return (
      <tr
        key={`entry-${this.state.path}-${name}`}
        className={`selectable-file ${this.state.selected[name] ? "selected-file" : ""}`}
        tabIndex={0}
        onClick={() => this.Select(name, info.size)}
        onKeyPress={onEnterPressed(() => this.Select(name, info.size))}
      >
        <td className="item-icon">
          { this.FileIcon(name) }
        </td>
        <td title={name}>{ name }</td>
        <td title={size} className="info-cell">{ size }</td>
      </tr>
    );
  }

  Directory(item) {
    const changeDirectory = () => this.ChangeDirectory(UrlJoin(this.state.path, item.name));
    return (
      <tr key={`entry-${this.state.path}-${item.name}`} className="directory" onClick={changeDirectory} onKeyPress={changeDirectory}>
        <td className="item-icon">
          <ImageIcon icon={DirectoryIcon} label="Directory" />
        </td>
        <td tabIndex="0" title={item.name}>{item.name}</td>
        <td className="info-cell">{(Object.keys(item.item).length - 1) + " Items"}</td>
      </tr>
    );
  }

  Items() {
    const currentDirectory = this.CurrentDirectory();

    const items = Object.keys(currentDirectory)
      .filter(name => name !== ".")
      .map(name => {
        return {
          name,
          item: currentDirectory[name],
          info: currentDirectory[name]["."],
        };
      });

    if(items.length === 0) {
      return (
        <tr><td/><td>No files</td><td/><td/></tr>
      );
    }

    // Sort items - directory first, then case-insensitive alphabetical order
    return (
      items.sort((item1, item2) => {
        if(item1.info.type !== item2.info.type) {
          if(item1.info.type === "directory") {
            return -1;
          } else {
            return 1;
          }
        } else {
          return item1.name.toLowerCase() < item2.name.toLowerCase() ? -1 : 1;
        }
      }).map(item => item.info.type === "directory" ? this.Directory(item): this.File(item.name, item.info))
    );
  }

  render() {
    let backButton;
    if(this.state.path && this.state.path !== Path.dirname(this.state.path)) {
      backButton = (
        <IconButton
          icon={BackIcon}
          label={"Back"}
          onClick={() => this.ChangeDirectory(Path.dirname(this.state.path))}
        />
      );
    }

    return (
      <div className="file-browser">
        <div className="file-browser-header">
          <h3>{this.props.header}</h3>
          <div className="file-browser-actions">
            <Action
              onClick={this.props.Cancel}
              className="secondary"
            >
              Cancel
            </Action>
            <Action onClick={() => this.props.Submit(Object.values(this.state.selected))}>
              Submit
            </Action>
          </div>
        </div>
        <div className="file-browser-content">
          <table>
            <thead>
              <tr>
                <th className="type-header">{backButton}</th>
                <th title={"Current Directory: " + this.state.displayPath} tabIndex="0">{this.state.displayPath}</th>
                <th className="size-header" />
              </tr>
            </thead>
            <tbody>
              { this.Items() }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

FileBrowser.propTypes = {
  header: PropTypes.string,
  baseFileUrl: PropTypes.string.isRequired,
  extensions: PropTypes.arrayOf(PropTypes.string),
  files: PropTypes.object.isRequired,
  mimeTypes: PropTypes.object,
  multiple: PropTypes.bool,
  Submit: PropTypes.func.isRequired,
  Cancel: PropTypes.func.isRequired
};

export default FileBrowser;
