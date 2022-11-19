var strata = [{description: 'Soft silty clay'}, {description: 'Fine sand'}, {description: 'Gravel'}]
var interpretedStrata = geologyInterpreter(strata);
console.log(interpretedStrata)

// This function accepts a list of dictionaries, if the 'description' of each object contains a string following the geological classification system commonly used in the United Kingdom, USCS class, grain type and Engineering properties are estimated for the material and returned.

function geologyInterpreter(strata){
    if (strata){

        for (var i = 0; i < strata.length; i++) {
            //make all string lowercase
            let descriptionString = strata[i].description.toLowerCase()
            let descriptionList = descriptionString.split(" ")

            let material = findMaterial(descriptionList, descriptionString)

            if (material.identifier==='clay') {material=analyseClay(descriptionString);}
            else if (material.identifier==='sand') {material=analyseSand(descriptionString);}
            else if (material.identifier==='gravel') {material=analyseGravel(descriptionString);}
            else if (material.identifier==='silt') {material=analyseSilt(descriptionString);}
            else if (material.identifier==='fill') {material=analyseFill(descriptionString);}
            else if (material.identifier==='rock') {material=analyseRock(descriptionString);}
            else if (material.identifier==='peat') {material=analyseOrganic(descriptionString);}


            strata[i].grain = material.grain
            strata[i].uscs = material.uscs
            strata[i].N = '-'
            strata[i].density = material.density
            strata[i].friction = material.friction
            strata[i].E = material.modulus
            strata[i].c = material.cDrained
            strata[i].cund = material.cUndrained

        }
    }
    return strata;
}

// This function determines which grain type the soil is, as well as the USCS class.

function findMaterial(descriptionList, descriptionString) {
    for (var j = 0; j < descriptionList.length; j++) {
      let materials_list = [
        {identifier: 'clay', uscs: "CH/CL", grain:'Fine'},
        {identifier: 'sand', uscs: "SW/SP/SM", grain:'Coarse'},
        {identifier: 'gravel', uscs: "GW/GP", grain:'Coarse'},
        {identifier: 'silt', uscs: "MH/ML", grain:'Fine'},
        {identifier: 'peat', uscs: "PT", grain:'Fine'},
      ]
      for (const material of materials_list){
        if(descriptionList[j] === material.identifier){
          return material
        }
      }
    }
    if (descriptionString.includes('made ground') || descriptionString.includes('made-ground') || descriptionString.includes('fill')) {
      return {identifier: 'fill', uscs: "-", grain:'Fill'}
    }
    else if (descriptionString.includes('rock') || descriptionString.includes('stone') || descriptionString.includes('chalk') || descriptionString.includes('marl') || descriptionString.includes('slate') || descriptionString.includes('salt')) {
      return {identifier: 'rock', uscs: "-", grain:'Rock'}
    }

    return {identifier: '-', uscs: "-", grain:'-'}
  }


// If given a sand this function reads the string in the geological description to determine the associated engineering parameters.

  function analyseSand(descriptionString) {

    const grain = 'Coarse'
    const default_material = {identifier: '-', uscs: "SW/SP/SM", grain:'Coarse'}

    let properties = {
      grain: grain,
      friction: 30,
      density: 20,
      modulus: null,
      cDrained: 0,
      cUndrained: 0,
    }

    if (descriptionString.includes('loose')) {
      properties.friction = 30; 
      properties.density = 16;
      if (descriptionString.includes('very loose')) {properties.friction = 28; properties.density = 15;}
    }
    else if (descriptionString.includes('dense')) {
      properties.friction = 33; 
      properties.density = 17;
      if (descriptionString.includes('medium dense')) {properties.friction = 32; properties.density = 17;}
      else if (descriptionString.includes('very dense')) {properties.friction = 34; properties.density = 18;}
      else if (descriptionString.includes('cemented')) {properties.friction = 35; properties.density = 18;}
    }

    if (descriptionString.includes('silty')) {properties.friction = properties.friction-2; properties.density = properties.density+1;}
    else if (descriptionString.includes('clayey')) {properties.friction = properties.friction-1; properties.density = properties.density+1;}
    
    if (descriptionString.includes('well')) {properties.friction = properties.friction+2;  properties.density = properties.density+1;}
    else if (descriptionString.includes('gap')) {properties.friction = properties.friction+1; properties.density = properties.density-1;}
    else if (descriptionString.includes('fine')) {properties.friction = properties.friction-2; properties.density = properties.density-1;}

    if (descriptionString.includes('angular')) {properties.friction = properties.friction+2}
    else if (descriptionString.includes('sub')) {properties.friction = properties.friction+1}

    //decide the USCS class and return the material
    let sandMaterialList = [
      {identifier: 'gravel', uscs: "SW/SP", grain:'Coarse'},
      {identifier: 'little fines', uscs: "SW/SP", grain:'Coarse'},
      {identifier: 'no fines', uscs: "SW/SP", grain:'Coarse'},
      {identifier: 'well', uscs: "SW", grain:'Coarse'},
      {identifier: 'poor', uscs: "SP", grain:'Coarse'},
      {identifier: 'silt', uscs: "SM", grain:'Coarse'},
    ]
    for (let material of sandMaterialList) {
      if (descriptionString.includes(material.identifier)){
        return Object.assign({}, material, properties)
      }
    }
    return Object.assign({}, default_material, properties)
  }



// If given a clay this function reads the string in the geological description to determines the associated engineering parameters.

  function analyseClay(descriptionString) {
    
    const grain = 'Fine'
    const default_material = {identifier: '-', uscs: "CH", grain:'Fine'}

    let properties = {
      grain: grain,
      friction: 28,
      density: 20,
      modulus: null,
      cDrained: 0,
      cUndrained: 25,
    }

    if (descriptionString.includes('plasticity')) {
      if (descriptionString.includes('low plasticity')) { properties.friction = 30;}
      else if (descriptionString.includes('intermediate plasticity')) {properties.friction = 28;}
      else if (descriptionString.includes('high plasticity')) {properties.friction = 25;}
    }

    if (descriptionString.includes('soft')) {
      if (descriptionString.includes('very soft')) { properties.friction = properties.friction-2; properties.density = 18; properties.cDrained = 0; properties.cUndrained=15;}
      else{properties.friction = properties.friction-1; properties.density = 19; properties.cDrained = 0; properties.cUndrained=25;}
    }
    else if (descriptionString.includes('firm')) {properties.friction = properties.friction-1; properties.density = 19.5; properties.cDrained = 10; properties.cUndrained=50;}
    else if (descriptionString.includes('stiff')) { 
      properties.density = 20.5;
      properties.cDrained = 10;
      properties.cUndrained=100;
      if (descriptionString.includes('very stiff')) { properties.friction = properties.friction+1; properties.density = 21.5; properties.cUndrained=150;}
    }

    if (descriptionString.includes('gravely')) {properties.friction = properties.friction+2}
    else if (descriptionString.includes('sandy')) {properties.friction = properties.friction+1}
    else if (descriptionString.includes('silty')) {properties.friction = properties.friction-1; properties.cUndrained=properties.cUndrained*0.8;}
    else if (descriptionString.includes('organic')) {properties.friction = properties.friction-2; properties.cUndrained=properties.cUndrained*0.5;}

    if (descriptionString.includes('fissured')) {properties.cUndrained=properties.cUndrained*0.8;}
    else if (descriptionString.includes('stratified')) {properties.cUndrained=properties.cUndrained*0.8;}
    else if (descriptionString.includes('weathered')) {properties.cUndrained=properties.cUndrained*0.6;}


    let clayMaterialList = [
      {identifier: 'peat', uscs: "PT", grain:'Fine'},
      {identifier: 'organic', uscs: "OL/PT", grain:'Fine'},
      {identifier: 'gravel', uscs: "CL", grain:'Fine'},
      {identifier: 'sand', uscs: "CL", grain:'Fine'},
      {identifier: 'silt', uscs: "CL", grain:'Fine'},
      {identifier: 'lean', uscs: "CL", grain:'Fine'},
      {identifier: 'low plasticity', uscs: "CL", grain:'Fine'},
      {identifier: 'medium plasticity', uscs: "CL", grain:'Fine'},
      {identifier: 'brick', uscs: "CL", grain:'Fine'},
      {identifier: 'fragments', uscs: "CL", grain:'Fine'},
    ]
    for (let material of clayMaterialList) {
      if (descriptionString.includes(material.identifier)){
        return Object.assign({}, material, properties)
      }
    }
    return Object.assign({}, default_material, properties)
  }

// If given a gravel this function reads the string in the geological description to determines the associated engineering parameters.

  function analyseGravel(descriptionString) {

    const grain = 'Coarse'
    const default_material = {identifier: '-', uscs: "GW/GP", grain:'Coarse'}

    let properties = {
      grain: grain,
      friction: 30,
      density: 20,
      modulus: null,
      cDrained: 0,
      cUndrained: 0,
    }

    if (descriptionString.includes('loose')) {
      properties.friction = 32; 
      properties.density = 19;
      if (descriptionString.includes('very loose')) {properties.friction = 30; properties.density = 18.5;}
    }
    else if (descriptionString.includes('dense')) {
      properties.friction = 36; 
      properties.density = 21;
      if (descriptionString.includes('medium dense')) {properties.friction = 35; properties.density = 20;}
      else if (descriptionString.includes('very dense')) {properties.friction = 38; properties.density = 21.5;}
    }

    if (descriptionString.includes('silty')) {properties.friction = properties.friction-3; properties.density = properties.density+1;}
    else if (descriptionString.includes('clayey')) {properties.friction = properties.friction-2; properties.density = properties.density+1;}
    
    if (descriptionString.includes('well')) {properties.friction = properties.friction+2}
    else if (descriptionString.includes('gap')) {properties.friction = properties.friction+1; properties.density = properties.density-1;}
    else if (descriptionString.includes('poorly')) {properties.friction = properties.friction+1; properties.density = properties.density-2;}
    else if (descriptionString.includes('uniform')) {properties.friction = properties.friction+1; properties.density = properties.density-2;}

    if (descriptionString.includes('angular')) {properties.friction = properties.friction+2}
    else if (descriptionString.includes('sub')) {properties.friction = properties.friction+1}


    let gravelMaterialList = [
      {identifier: 'well', uscs: "GW", grain:'Coarse'},
      {identifier: 'Fine', uscs: "GW", grain:'Coarse'},
      {identifier: 'rounded', uscs: "GW", grain:'Coarse'},
      {identifier: 'poor', uscs: "GP", grain:'Coarse'},
      {identifier: 'angular', uscs: "GP", grain:'Coarse'},
      {identifier: 'coarse', uscs: "GP", grain:'Coarse'},
    ]
    for (let material of gravelMaterialList) {
      if (descriptionString.includes(material.identifier)){
        return Object.assign({}, material, properties)
      }
    }
    return Object.assign({}, default_material, properties)
  }


// If given a silt this function reads the string in the geological description to determines the associated engineering parameters.

  function analyseSilt(descriptionString) {
    
    const grain = 'Fine'
    const default_material = {identifier: '-', uscs: "MH/ML", grain:'Fine'}

    let properties = {
      grain: grain,
      friction: 25,
      density: 17,
      modulus: null,
      cDrained: 0,
      cUndrained: 0,
    }

    if (descriptionString.includes('alluvium') || descriptionString.includes('river')) {
      properties.friction = 22; 
      properties.cUndrained = 5; 
      properties.density = 16; 
    }
    else if (descriptionString.includes('soft')) {
      properties.friction = 26; 
      properties.density = 17; 
      if (descriptionString.includes('very soft')) {
        properties.friction = 24; 
        properties.density = 17; 
      }
    } 
    else if (descriptionString.includes('firm')) {
      properties.friction = 28; 
      properties.density = 18; 
    }

    if (descriptionString.includes('sandy')) {
      properties.friction = properties.friction+1; 
    }
    else if (descriptionString.includes('organic')) {
      properties.friction = properties.friction-1; 
    }

    if (descriptionString.includes('coarse')) {
      properties.friction = properties.friction+1; 
    }
    else if (descriptionString.includes('fine')) {
      properties.friction = properties.friction-1; 
    }

    let siltMaterialList = [
      {identifier: 'very Fine', uscs: "ML", grain:'Fine'},
      {identifier: 'clay', uscs: "ML", grain:'Fine'},
      {identifier: 'clay', uscs: "ML", grain:'Fine'},
      {identifier: 'rock', uscs: "ML", grain:'Fine'},
      {identifier: 'fragments', uscs: "ML", grain:'Fine'},
      {identifier: 'micaceous', uscs: "MH", grain:'Fine'},
      {identifier: 'diatomaceous', uscs: "MH", grain:'Fine'},
      {identifier: 'elastic', uscs: "MH", grain:'Fine'},
    ]
    for (let material of siltMaterialList) {
      if (descriptionString.includes(material.identifier)){
        return Object.assign({}, material, properties)
      }
    }
    return Object.assign({}, default_material, properties)
  }


// If given a fill this function reads the string in the geological description to determines the associated engineering parameters.

  function analyseFill(descriptionString) {

    const grain = 'Fill'
    const default_material = {identifier: 'fill', uscs: "-", grain:'Fill'}

    let properties = {
      grain: grain,
      friction: 30,
      density: 18,
      modulus: null,
      cDrained: 0,
      cUndrained: 0,
    }
    if (descriptionString.includes('fill')) {
      if (descriptionString.includes('rock fill')) {properties.friction = 40; properties.density = 17;}
      else if (descriptionString.includes('chalk fill')) {properties.friction = 32; properties.density = 17;}
      else if (descriptionString.includes('graded fill')) {properties.friction = 38; properties.density = 19;}
      else if (descriptionString.includes('sand fill')) {properties.friction = 35; properties.density = 17;}
      else if (descriptionString.includes('clay fill')) {properties.friction = 28; properties.density = 20;}
    }
    else if (descriptionString.includes('hardcore')) {properties.friction = 38; properties.density = 16;}
    else if (descriptionString.includes('pfa')) {properties.friction = 35; properties.density = 14;}
    else if (descriptionString.includes('slag')) {properties.friction = 32; properties.density = 14;}
    else if (descriptionString.includes('ashes')) {properties.friction = 32; properties.density = 14;}

    if (descriptionString.includes('loose')) {properties.friction = properties.friction-2; properties.density = properties.density-1;}
    else if (descriptionString.includes('compacted')) {properties.friction = properties.friction+2; properties.density = properties.density+1;}
    
    if (descriptionString.includes('silty')) {properties.friction = properties.friction-2}

    return Object.assign({}, default_material, properties)
  }


// If given a rock this function reads the string in the geological description to determines the associated engineering parameters.

  function analyseRock(descriptionString) {

    const grain = 'Rock'
    const default_material = {identifier: 'rock', uscs: "-", grain:'Rock'}

    let properties = {
      grain: grain,
      friction: 30,
      density: 22,
      modulus: null,
      cDrained: 0,
      cUndrained: 0,
    }
    if (descriptionString.includes('marl')) {properties.friction = 32; properties.density = 21;}
    else if (descriptionString.includes('sandstone')) {properties.friction = 40; properties.density = 23;}
    else if (descriptionString.includes('mudstone')) {properties.friction = 30; properties.density = 23;}
    else if (descriptionString.includes('shale')) {properties.friction = 32; properties.density = 21;}
    else if (descriptionString.includes('chalk')) {
      if (descriptionString.includes('i') || descriptionString.includes('ii') || descriptionString.includes('1') || descriptionString.includes('2')) {properties.friction = 35; properties.density = 16;}
      if (descriptionString.includes('iii') || descriptionString.includes('iv') || descriptionString.includes('3') || descriptionString.includes('4')) {properties.friction = 32; properties.density = 15;}
      if (descriptionString.includes('v') || descriptionString.includes('vi') || descriptionString.includes('5') || descriptionString.includes('6')) {properties.friction = 30; properties.density = 14;}
    }

    if (descriptionString.includes('very weak')) {properties.friction = properties.friction-2;}
    
    if (descriptionString.includes('thickly bedded')) {properties.friction = properties.friction-1;}
    else if (descriptionString.includes('thickly laminated')) {properties.friction = properties.friction-2;}
    else if (descriptionString.includes('thinly laminated')) {properties.friction = properties.friction-2;}


    return Object.assign({}, default_material, properties)
  }


// If given an organic this function reads the string in the geological description to determines the associated engineering parameters.

  function analyseOrganic(descriptionString) {

    const grain = 'Organic'
    const default_material = {identifier: 'peat', uscs: "-", grain:'Organic'}

    let properties = {
      grain: grain,
      friction: 0,
      density: 12,
      modulus: null,
      cDrained: 0,
      cUndrained: 5,
    }
    if (descriptionString.includes('firm')) {properties.friction = 10;}
    else if (descriptionString.includes('spongy')) {properties.friction = 5;}
    else if (descriptionString.includes('plastic')) {properties.friction = 5;}

    return Object.assign({}, default_material, properties)
  }


