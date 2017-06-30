var settingsToLoad = [['fCloneDepth', 'Forge.CloneDepth'], ['fCloneMultiplier', 'Forge.CloneMultiplier'], ['fRotationSnap', 'Forge.RotationSnap'], ['fRotationSens', 'Forge.RotationSensitivity'],['fMonitorSpeed', 'Forge.RotationSensitivity']];

var selectedItem;
var itemNumber = 0;
var tabIndex = 0;
var hasGP = false;

$(document).keyup(function (e) {
    if (e.keyCode === 27) {
        $('#playerBreakdown').hide();
        dew.hide();
    }
});
$(document).keydown(function (e) {
    if(e.keyCode == 84 || e.keyCode == 89){
        var teamChat = false;
        if(e.keyCode == 89){ teamChat = true };
        dew.show("chat", {'captureInput': true, 'teamChat': teamChat});
    }
    if(e.keyCode == 192 || e.keyCode == 112 || e.keyCode == 223){
        dew.show("console");
    }
});

function closeBrowser() {
    dew.hide();
}

$(document).ready(function() {
    loadSettings(0);     
    $('#forgeControls input').on('change', function(){
        updateSetting(this.name, this.value);
    }); 
    if(hasGP){
        updateSelection(itemNumber);
    }    
});

function loadSettings(i) {
	if (i != settingsToLoad.length) {
		dew.command(settingsToLoad[i][1], {}).then(function(response) {
            response = parseFloat(response);
            if ($("#"+settingsToLoad[i][0]).is(':checkbox')){
                if (response == "1"){
                    $("#"+settingsToLoad[i][0]).prop('checked', true);
                }                
            }else{
                $("#"+settingsToLoad[i][0]).val(response);
            }
            if($('#'+settingsToLoad[i][0]).hasClass('hasTiny')){
                $('#'+settingsToLoad[i][0]+'Text').val(response);
            }
			i++;
			loadSettings(i);
		});
	} else {
		loadedSettings = true;
	}
}

function updateSetting(setting, value){
    if ($("input[name='"+setting+"']").is(':checkbox')){
        if ($("input[name='"+setting+"']").is(':checked')){
            value = "1";
        } else {
            value = "0";
        }
    }
    dew.command(settingsToLoad[arrayInArray(setting, settingsToLoad)][1] + " \"" + value + "\"", {}).then(function(response){
        //dew.command("writeconfig");
    });
}

function arrayInArray(needle, haystack) {
    for(i=0; i<haystack.length; i++) {
        if (haystack[i].indexOf(needle) > -1){
            return i
        }
    }
}

function updateSelection(item){
    $('.selected').removeClass();
    $("#forgeControls label").eq(item).addClass('selected');
    selectedItem = $('#forgeControls').children().not('label,center,br,.tinySetting,.header,p').eq(itemNumber).attr('id');
}

function upNav(){
    if(itemNumber > 0){
        itemNumber--;
        updateSelection(itemNumber);
    }
}

function downNav(){
    if(itemNumber < $('#forgeControls label').length-1){
        itemNumber++;
        updateSelection(itemNumber);
    }           
}

function leftToggle(){
    if($('#'+selectedItem).getInputType() == "select"){
        var elementIndex = $('#'+selectedItem+' option:selected').index();
        if(elementIndex > 0){
            var newElement = elementIndex - 1;
            $('#'+selectedItem+' option').eq(newElement).prop('selected', true);
            if(selectedItem == 'presetMenu'){
                applyBindString($('#'+selectedItem).val());
            } else {
                updateSetting($('#'+selectedItem).attr('name'), $('#'+selectedItem).val());
            }
        }
    }
    if($('#'+selectedItem).getInputType() == "range"){
        document.getElementById(selectedItem).stepDown();
        document.querySelector('#'+selectedItem +'Text').value = document.getElementById(selectedItem).value;
        updateSetting($('#'+selectedItem).attr('name'), $('#'+selectedItem).val());
    }        
}

function rightToggle(){
    if($('#'+selectedItem).getInputType() == "select"){
        var elementIndex = $('#'+selectedItem+' option:selected').index();
        var elementLength = $('#'+selectedItem).children('option').length;
        if(elementIndex < elementLength){
            var newElement = elementIndex + 1;
            $('#'+selectedItem+' option').eq(newElement).prop('selected', true);
            if(selectedItem == 'presetMenu'){
                applyBindString($('#'+selectedItem).val());
            } else {
                updateSetting($('#'+selectedItem).attr('name'), $('#'+selectedItem).val());
            }
        }
    }
    if($('#'+selectedItem).getInputType() == "range"){
        document.getElementById(selectedItem).stepUp();
        document.querySelector('#'+selectedItem +'Text').value = document.getElementById(selectedItem).value;
        updateSetting($('#'+selectedItem).attr('name'), $('#'+selectedItem).val());
    }        
}

$.fn.getInputType = function () {
    return this[0].tagName.toString().toLowerCase() === "input" ?
        $(this[0]).attr("type").toLowerCase() : this[0].tagName.toLowerCase();
};

function onControllerConnect(){
    updateSelection(itemNumber); 
    dew.command('Game.IconSet', {}).then(function(controllerType){
        $("#buttonBar img").eq(0).attr("src","dew://assets/buttons/"+controllerType+"_X.png");
        $("#buttonBar img").eq(1).attr("src","dew://assets/buttons/"+controllerType+"_Y.png");
        $('#buttonBar img').show();
    });
}

function onControllerDisconnect(){
    $('.selected').removeClass(); 
    $('button img').hide();    
}

dew.on("show", function(e){
    dew.command('Settings.Gamepad', {}).then(function(result){
        if(result == 1){
            onControllerConnect();
            hasGP = true;
        }else{
            onControllerDisconnect();
            hasGP = false;
        }
    });
    dew.command('Forge.DumpPrefabs', {}).then(function(response){
        $("#forgePrefabs").empty();
        var forgeSelect = document.getElementById('forgePrefabs');
        var prefabList = JSON.parse(response);
        for(i=0; i<prefabList.length; i++){
            var opt = document.createElement('option');
            opt.innerHTML = prefabList[i];
            opt.value = prefabList[i];
            forgeSelect.appendChild(opt);
        }
    });
});


dew.on('controllerinput', function(e){       
    if(hasGP){
        if(e.data.A == 1){
            if(selectedItem == 'forgePrefabs'){
                $('#spawnPrefab').click();
            }
        }
        if(e.data.B == 1){
            dew.hide();  
        }
        if(e.data.X == 1){
            dew.command('Forge.Canvas');  
        }
        if(e.data.Y == 1){
            dew.command('Forge.DeleteAll');  
        }
        if(e.data.Up == 1){
            upNav();  
        }
        if(e.data.Down == 1){
            downNav();
        }
        if(e.data.Left == 1){
            leftToggle()
        }
        if(e.data.Right == 1){
            rightToggle(); 
        }
    }
});