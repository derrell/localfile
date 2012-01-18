/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#asset(localfile/demo/*)


************************************************************************ */

/**
 * This is the main application class of your custom application "localfile"
 */
qx.Class.define("localfile.demo.Application",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        var             appender;
        appender = qx.log.appender.Native;
        appender = qx.log.appender.Console;
      }

      // Create a Retrieve button
      var button = new localfile.Retrieve("An Image");

      // Document is the application root
      var doc = this.getRoot();
			
      // Add button to document at fixed coordinates
      doc.add(button, { left: 100, top: 50 });
      
      // Create a previewer for images
      var imagePreviewer = new localfile.preview.Image();
      
      // Add the previewer
      doc.add(imagePreviewer, { left : 100, top : 100 });
      
      // Establish this previewer as the one for all images
      button.setPreviewer("image/*", imagePreviewer);
      
      // Listen for the "fileData" event
      button.addListener(
        "changeValue",
        function(e)
        {
          this.debug("Retrieved file data: " + e.getData());
        });
      
      // Listen for the "error" event
      button.addListener(
        "error",
        function(e)
        {
          alert("ERROR: " + e + " (" + e.getMessage() + ")");
        });
    }
  }
});
