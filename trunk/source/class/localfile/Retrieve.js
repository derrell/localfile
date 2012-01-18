/*
 * Copyright:
 *   2011 Derrell Lipman
 *   
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *   See the LICENSE file in the project's top-level directory for details.
 *
 * Authors:
 *   Derrell Lipman (derrell)
 */

/*
#asset(localfile/*)
*/

/**
 * This is the main class of contribution "localfile"
 *
 * @lint ignoreUndefined(uploadwidget)
 */
qx.Class.define("localfile.Retrieve",
{
  extend : uploadwidget.UploadButton,

  /*
   * @param fieldName {String} upload field name
   * @param label {String} button label
   * @param icon {String} icon path
   * @param command {Command} command instance to connect with
   */
  construct: function(label, icon, command)
  {
    // Call the superclass constructor. Use a grid layout.
    this.base(arguments, null, label, icon, command);
        
    // Create the previewers map
    this._previewers = {};

    // When the file name changes, begin retrieving the file data
    this.addListener("changeFileName", this._onChangeFileName, this);
  },

  events :
  {
    /**
     * Fired when retrieved file data is available. The event data is the
     * file contents, in Data URL format.
     */
    changeValue : "qx.event.type.Data",

    /**
     * Fired when an error occurred while retrieving file data. The event data
     * is a progress object which contains a getMessage() method.
     */
    error    : "qx.event.type.Data"
  },

  properties :
  {
    /** What format the data should be returned in */
    resultType :
    {
      init  : "dataURL",
      check : function(value)
      {
        qx.lang.Array.contains([ "binary", "text", "dataURL" ], value);
      }
    },
    
    /** The file contents retrieved from a local file */
    value :
    {
      init     : null,
      nullable : true,
      event    : "changeValue"
    }
  },

  members :
  {
    /** Map of previewers */
    __previewers : null,

    /** The format of the current data request */
    __dataFormat : null,

    /**
     * Set a previewer. 
     *
     * @param mimeType {String}
     *
     *   A MIME type or MIME type "wildcard" (e.g., "image/*")
     *
     * @param previewer {localfile.IPreviewer}
     *   A widget which implements localfile.IPreviewer. The widget's
     *   setData() method must accepts a Data URL as its one and only
     *   parameter. Each previewer other than the one matching the MIME type
     *   of a selected file is hidden, so all previewers may reside in the
     *   same physical location.
     *
     * Note: Previewers will only be used if the resultType property is set
     * to "dataURL".
     */
    setPreviewer : function(mimeType, previewer)
    {
      // Ensure that the previewer implements the previewer interface
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInterface(previewer, 
                             localfile.preview.IPreviewer,
                             "setPreviewer()");
      }
      
      // Save the previewer for this mime type
      this._previewers[mimeType] = previewer;
    },

    
    /**
     * Event handler for the "changeFileName" event
     *
     * @param e {qx.event.type.Event}
     *   The event object. The target of the event is the upload button that
     *   was used to select a file name.
     */
    _onChangeFileName : function(e)
    {
      var             uploadButton;
      var             uploadElement;
      var             selection;
      
      // Obtain and save a file reader object
      this._uploadReader = new qx.bom.FileReader();

      // Arrange to be told when the file is fully loaded
      this._uploadReader.addListener("load", this._onUploadLoad, this);
      this._uploadReader.addListener("error", this._onUploadError, this);

      // Obtain the uploadButton so we can retrieve its selection
      uploadButton = e.getTarget();

      // Get the selected File object
      uploadElement = uploadButton.getInputElement().getDomElement();
      selection = uploadElement.files[0];

      // Save the format in which the user requested the data
      this.__dataFormat = this.getResultType();

      // Begin reading the file. Request it in the required format.
      switch(this.__dataFormat)
      {
      case "binary":
        this._uploadReader.readAsBinaryString(selection);
        break;
        
      case "text":
        this._uploadReader.readAsText(selection);
        break;
        
      case "dataURL":
        this._uploadReader.readAsDataURL(selection);
        break;
      }
    },
    

    /**
     * Event handler for a "load" event on the FileReader.
     *
     * @param e {qx.event.type.Data}
     *   The data has a 'content' member which contains the file data just
     *   read.
     */
    _onUploadLoad : function(e)
    {
      var             content;
      var             dataUrlParts;
      var             parts;
      var             mimeType;
      var             previewer;

      // Retrieve the data URL from the upload button, and save it.
      content = e.getData().content;
      this.setUserData("fileData", content);

      // Extract the parts of the Data URL
      dataUrlParts = new RegExp("^data:([^/]+)/([^;]+);base64,");
      parts = content.match(dataUrlParts);
      
      // Hide all previewers
      for (mimeType in this._previewers)
      {
        this._previewers[mimeType].hide();
      }

      // If the request format was a Data URL...
      if (this.__dataFormat == "dataURL")
      {
        // ... then look for a previewer for this type. Try an exact match,
        // and also try a wildcard match.
        previewer =
          this._previewers[parts[1] + "/" + parts[2]] ||
          this._previewers[parts[1] + "/*"];

        // Did we find one?
        if (previewer)
        {
          // Yup. Set its data
          previewer.setData(content);

          // Show it!
          previewer.show();
        }
      }
      
      // Store the file contents in our value property
      this.setValue(content);
    },
    

    /**
     * Event handler for an "error" event on the FileReader object.
     *
     * @param e {qx.event.type.Data}
     *   The data has a 'progress' member which contains information about the
     *   error. The 'progress' member also has a getMessage() method which
     *   returns additional information about the error.
     */
    _onUploadError : function(e)
    {
      // Notify listeners that an error occurred
      this.fireDataEvent("error", e.progress);

      // Clean up
      this._uploadReader.dispose();
      this._uploadReader = null;
    }
  }
});
