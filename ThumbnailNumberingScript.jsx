// Function to save the document as a JPG or PNG
function saveAsImage(saveFile, format) {
    if (format === "JPG") {
        var jpgOptions = new JPEGSaveOptions();
        jpgOptions.quality = 12; // Adjust quality from 1 (low) to 12 (max)
        app.activeDocument.saveAs(saveFile, jpgOptions, true, Extension.LOWERCASE);
    } else if (format === "PNG") {
        var pngOptions = new PNGSaveOptions();
        app.activeDocument.saveAs(saveFile, pngOptions, true, Extension.LOWERCASE);
    }
}

// Function to create the ScriptUI dialog
function createDialog() {
    var dialog = new Window("dialog", "Batch Export Layers");
    dialog.alignChildren = "fill";

    // Starting and Ending Numbers
    var numGroup = dialog.add("group");
    numGroup.add("statictext", undefined, "Starting Number:");
    var startNumber = numGroup.add("edittext", undefined, "1");
    startNumber.characters = 5;

    numGroup.add("statictext", undefined, "Ending Number:");
    var endNumber = numGroup.add("edittext", undefined, "10");
    endNumber.characters = 5;

    // Layer Selection Dropdown
    var layerGroup = dialog.add("group");
    layerGroup.add("statictext", undefined, "Select Layer:");
    var layerDropdown = layerGroup.add("dropdownlist", undefined, []);
    layerDropdown.minimumSize.width = 200;

    // Populate layer dropdown with text layers
    for (var i = 0; i < app.activeDocument.layers.length; i++) {
        var layer = app.activeDocument.layers[i];
        if (layer.kind == LayerKind.TEXT) {
            layerDropdown.add("item", layer.name);
        }
    }
    layerDropdown.selection = 0; // Default to first layer

    // Export Path
    var pathGroup = dialog.add("group");
    pathGroup.add("statictext", undefined, "Export Path:");
    var exportPath = pathGroup.add("edittext", undefined, Folder.desktop.toString());
    exportPath.characters = 20;
    var browseButton = pathGroup.add("button", undefined, "Browse");

    browseButton.onClick = function () {
        var selectedFolder = Folder.selectDialog("Select a folder to save the images to");
        if (selectedFolder != null) {
            exportPath.text = selectedFolder.fsName;
        }
    };

    // Naming Convention
    var nameGroup = dialog.add("group");
    nameGroup.add("statictext", undefined, "Naming Convention:");
    var baseName = nameGroup.add("edittext", undefined, "episode_");
    baseName.characters = 15;

    // Image Format Selection
    var formatGroup = dialog.add("group");
    formatGroup.add("statictext", undefined, "Image Format:");
    var formatDropdown = formatGroup.add("dropdownlist", undefined, ["JPG", "PNG"]);
    formatDropdown.selection = 0; // Default to JPG

    // OK and Cancel Buttons
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    var okButton = buttonGroup.add("button", undefined, "OK");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");

    // Show dialog and return user selections if OK is pressed
    if (dialog.show() === 1) {
        return {
            startNumber: parseInt(startNumber.text, 10),
            endNumber: parseInt(endNumber.text, 10),
            layerName: layerDropdown.selection.text,
            exportPath: exportPath.text,
            baseName: baseName.text,
            format: formatDropdown.selection.text
        };
    } else {
        return null; // User canceled
    }
}

// Main function to create images with numbered text
function createEpisodeImages() {
    // Show the dialog and get user inputs
    var userInput = createDialog();
    if (!userInput) {
        alert("Operation canceled.");
        return;
    }

    // Input validation
    if (isNaN(userInput.startNumber) || isNaN(userInput.endNumber) || userInput.startNumber > userInput.endNumber) {
        alert("Please enter valid numbers, with the start number less than or equal to the end number.");
        return;
    }

    // Find the selected layer by name
    var selectedLayer = findLayerByName(userInput.layerName);
    if (!selectedLayer) {
        alert("Selected layer not found!");
        return;
    }

    // Check if the selected layer is visible
    if (!selectedLayer.visible) {
        alert("The selected layer is hidden. Please make it visible before running the script.");
        return;
    }

    // Loop from startNumber to endNumber and save each image
    for (var i = userInput.startNumber; i <= userInput.endNumber; i++) {
        // Update the text content on the selected layer
        selectedLayer.textItem.contents = i.toString();

        // Define the file name and path using the base name
        var filePath = userInput.exportPath + "/" + userInput.baseName + i + "." + userInput.format.toLowerCase();
        var saveFile = new File(filePath);

        // Save the current document as an image
        saveAsImage(saveFile, userInput.format);
    }

    // Keep the last number on the selected layer
    selectedLayer.textItem.contents = userInput.endNumber.toString();
}

// Function to find a layer by name
function findLayerByName(layerName) {
    for (var i = 0; i < app.activeDocument.layers.length; i++) {
        var layer = app.activeDocument.layers[i];
        if (layer.name === layerName) {
            return layer;
        }
    }
    return null;
}

// Run the main function
createEpisodeImages();
