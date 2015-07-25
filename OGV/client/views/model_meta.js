/**                     M O D E L _ M E T A . J S
 * BRL-CAD
 *
 * Copyright (c) 1995-2013 United States Government as represented by
 * the U.S. Army Research Laboratory.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 2.1 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this file; see the file named COPYING for more
 * information.
 */

/**
 * @file OGV/client/views/model_meta.js
 *
 * Helpers and events for editing models.
 */

/**
 * Update information about model
 *
 * Each model has some information associated with it, it can be name
 * bio or a representative image. Whenever user uploads he gets an option
 * to edit this information.
 */

Template.modelMeta.events({
    'submit #uploader-form': function(e, t)
    {
	e.preventDefault();
	
	var modelMetaForm = $(e.currentTarget),
	    filename = modelMetaForm.find('#desc-filename').val().toLowerCase(),
	    description = modelMetaForm.find('#desc-about').val(),
	    thumbnail,
	    modelId = modelMetaForm.find('#model-id').val(),
	    currentUser = Meteor.user();
	    
	/**
	* Adding the checkd boxes to an array named category
	*/
	var category = Array();
	$("input:checkbox[name=category]:checked").each(function(){
    	category.push($(this).val());
	})

	file = $('#desc-model-thumb')
	var currentModel = ModelFiles.findOne(modelId);		

	var fsFile = new FS.File(e.target[2].files[0]);
	fsFile.gFile = modelId;      

	if(document.getElementById("desc-model-thumb").files.length == 0){
		/**
		* The part to be implemented when the user has left the thumbnail input field
		* empty knowingly/unknowingly.
		*/
		var x = confirm("Are you sure you don't want to add/change thumbnail of your model?");
		if(x){
			/**
			* If the user left the thumbnail input field empty knowingly
			*/
			ModelFiles.update(modelId, {$set: {name: filename, about: description}}, function(error, res) {
			    if (error) {
					throwError(error.reason);
			    } else {
					throwNotification("Data about model has been saved");
			    }
			});
			if(category.length > 0){
				ModelFiles.update(modelId, {$set: {categories: category}}, function(error, res) {
			    if (error) {
					throwError(error.reason);
			    } else {
					throwNotification("Data about model has been saved");
			    }
			});
			}

			var uploadedModel = ModelFiles.findOne(modelId);
			if( uploadedModel.converted ){
				Router.go('/my-models');
				throwNotification("Data about model has been saved");
			} else {
				ModelFiles.remove(uploadedModel._id);
				ThumbFiles.remove(uploadedModel.thumbnail);
				Router.go('/upload');
				throwError("There was some error in converting your uploaded file");
			}
		 
		}
	} else {
		/** 
		* Delete any thumbnail association with the model. Thumbnail will be deleted before updating. 
		* No thumbnail deletion will happen if there is no thumbnail present yet.
		*/
    	var prevThumbnail = ThumbFiles.findOne(currentModel.thumbnail);
    	if(typeof prevThumbnail != 'undefined'){
			ThumbFiles.remove(currentModel.thumbnail);
    	}
	
		ThumbFiles.insert(fsFile,function(err,thumbFile) {
		    if (err) {
				throwError(err.reason);
		    } else {
				throwNotification("Thumbnail Image has been Uploaded" );
				ModelFiles.update(modelId, {$set: {name: filename, about: description, thumbnail:fsFile._id}}, function(error, res) {
				    if (error) {
					throwError(error.reason);
				    } else {
					throwNotification("Data about model has been saved");
				    }
				});
				if(category.length > 0){
					ModelFiles.update(modelId, {$set: {categories: category}}, function(error, res) {
			    	if (error) {
						throwError(error.reason);
			    	} else {
						throwNotification("Data about model has been saved");
			    	}
					});
				}

				var uploadedModel = ModelFiles.findOne(modelId);
				if( uploadedModel.converted ){
					Router.go('/my-models');
					throwNotification("Data about model has been saved");
				} else {
					ModelFiles.remove(uploadedModel._id);
					ThumbFiles.remove(uploadedModel.thumbnail);
					Router.go('/upload');
					throwError("There was some error in converting your uploaded file");

				}
		    }
		});
	}
	}
	
});
	
Template.modelMeta.modelCategory = function() 
{
/**
* helper to display already present categories in the model
* Diplayed everytime when the /description/:_id page is viewed
* Displays nothing if categories is empty.
*/
var id = Session.get('modelId');
return ModelFiles.findOne({_id: id}); 
};