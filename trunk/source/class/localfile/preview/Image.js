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
 */
qx.Class.define("localfile.preview.Image",
{
  extend : qx.ui.basic.Image,
  
  implement : [ localfile.preview.IPreviewer ],
  
  construct : function()
  {
    // Call the superclass constructor
    this.base(arguments);

    // Provide some basic default settings
    this.set(
      {
        width     : this.constructor.DEFAULT_WIDTH,
        height    : this.constructor.DEFAULT_HEIGHT,
        scale     : true
      });
  },
  
  statics :
  {
    DEFAULT_HEIGHT : 60,
    DEFAULT_WIDTH  : 60
  },

  members :
  {
    setData : function(dataUri)
    {
      this.setSource(dataUri);
    }
  }
});
