(function () {
	var nodeTypes = {
		suite: 'Suite',
		testContainer: 'TestContainer',
		verificationRegion: 'VerificationRegion'
	};
	var isNodeTypeSupport = function (nodeType) {
		for (var p in nodeTypes) {
			if (nodeTypes[p] === nodeType)
				return true;
		}
	};

	var getNodeType =  function (context) {
		return __reportExtension.utils.fromDetailData.getReportNodeType(context.detailData);
	};

	var isSupportedVerificationTO = function (context){
		if (context && context.detailData && context.detailData.type === "Step"){
			var operationDetails = context.detailData.test_obj_info;

			var overviewData = context.detailData.overview;

			if (overviewData.caption.indexOf("Run Error") > -1 && context.detailData.raw_data.Data.ErrorText){
				return false;
			}

			if (typeof(operationDetails.operation) === 'string'){
				var operation = operationDetails.operation.toLowerCase();
				if (operation === "verifyimageexists" || operation === "verifyimagematch" ){
					return true;
				}
			}
		}
		return false;
	};

	__reportExtension.addExternalRender('RKey:TestFlowTree.Node.Visibility', {
		// preCheck callback
		preCheck: function (context, args) {
			var nodeType = __reportExtension.utils.fromDetailData.getReportNodeType(context.detailData);
			if (isNodeTypeSupport(nodeType))
				args.needExec = true;

			if (context && context.nodeDataModel && context.nodeDataModel.caption && context.nodeDataModel.caption.objects_chain){
				context.nodeDataModel.caption.objects_chain.map(function(item){
					if (item.icon_key === "bgicon-default-test-obj"){
						item.icon_key = "c-icon-" + item.object_type.split(".")[1];
					}
				})
			}

			// change verifyImageExists icon
			if (isSupportedVerificationTO(context)){
				if (context.detailData.status === "error")
					context.nodeDataModel.status_indicator_iconkey = "VerifyFailure"
				else
					context.nodeDataModel.status_indicator_iconkey = "VerifySuccess"
			}
		},

		// execute callback
		execute: function (context, args) {
			context.show_node = true;
		}
	});

	__reportExtension.addExternalRender('RKey:DetailsPane.Caption', {
		preCheck: function (context, args) {
			if (isNodeTypeSupport(getNodeType(context)))
				args.needExec = true;

			// the context contains TO with verification
			if (isSupportedVerificationTO(context))
				args.needExec = true;
		},

		// execute callback
		execute: function (context, args) {
			var caption = "";
			var nodeType = getNodeType(context);
			var isError = context.detailData.status;
			if (isNodeTypeSupport(nodeType)){
				var detailsCaption = isError.toLowerCase() === 'error' ? 'Error': nodeType.split(/(?=[A-Z])/).join(" ");
				caption = '<span class=my-ext-details-caption>' + detailsCaption + ' Details</span>';
			}
			else{
				var detailsCaption =isError.toLowerCase() === 'error' ? 'Error' : 'Verification';
				caption = '<span class=my-ext-details-caption>' + detailsCaption + 'Details</span>';
			}
			new DetailsPaneCaptionRenderer(caption).render(context.parent);
		}
	});

	__reportExtension.addExternalRender('RKey:DetailsPane.Section.Overview.Caption', {
		preCheck: function (context, args) {
			if (isNodeTypeSupport(getNodeType(context)))
				args.needExec = true;

			// the context contains TO with verification
			if (isSupportedVerificationTO(context))
				args.needExec = true;
		},

		// execute callback
		execute: function (context, args) {
			var caption = "";
			var nodeType = getNodeType(context);
			var errorText = context.detailData.status.toLowerCase() == 'error' ? "Run Error - " : "";
			if (isNodeTypeSupport(nodeType)) {
				caption = '<span class="cust-caption-detail">'+ errorText + nodeType.split(/(?=[A-Z])/).join(" ") + '</span>';
			}
			else{
				caption = '<span class="cust-caption-detail"> + errorText + Verification</span>';
			}
			new DetailsOverviewSectionCaptionRenderer(caption).render(context.parent);
		}
	});


	__reportExtension.addExternalRender('RKey:TestFlowTree.Node.Caption.Icon', {
		// preCheck callback
		preCheck: function (context, args) {
			var nodeType = __reportExtension.utils.fromReportNode.getReportNodeType(context.reportNode);
			if (nodeType === nodeTypes.suite || nodeType === nodeTypes.testContainer)
				args.needExec = true;
		},

		// execute callback
		execute: function (context, args) {
			var nodeType = __reportExtension.utils.fromReportNode.getReportNodeType(context.reportNode);
			switch(nodeType) {
				case nodeTypes.suite:
					context.icon_key = 'my-node-suite-icon';
					context.icon_tooltip = context.icon_tooltip;
					break;
				case nodeTypes.testContainer:
					context.icon_key = 'my-node-test-container-icon';
					context.icon_tooltip = 'Test Container(\"' + context.reportNode.Data.Name + '\")';
					break;
			}
		}
	});
})();

