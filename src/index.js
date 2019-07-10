//
// udk-orga - index.js
// handles all the client side javascript
//
// CONTENTS
//
// 1. includes
// 2. requester object
// 3. graph object
// 4. window.onload


//
// 1. includes
//
import ForceGraph3d from '3d-force-graph';
require('three');
import SpriteText from 'three-spritetext';
require('./index.scss');
import * as d3 from 'd3-force-3d';
require('d3-dsv');
require('d3-octree');


//
// 2. the requester object handles server xmlhttp requests
//
const requester = {
    getAll: function(urls){ // urls is an array
        return new Promise( (resolve, reject) => {
            var f = {
                get: function(i){
                    var promise = new Promise( (resolve, reject) => {
                        var req = new XMLHttpRequest();
                        req.open('GET', urls[i]);
                        req.onload = function(){
                            if (req.status === 200) { resolve(req.responseText); }
                            else { console.log('Error' + req.statusText); }
                        }
                        req.send(null);
                    }); // var promise
                    return promise;
                } // get method
            } // obj f
            var promises = []; // array that holds all the request promises 
            for (let i = 0; i < urls.length; i++){ promises.push( f.get(i) ); } // for each requested url, push one response
            Promise.all(promises).then( (dataArr) => { // if all sub promises are done, resolve the getAll promise
                for (let i in dataArr){ dataArr[i] = JSON.parse(dataArr[i]); }
                resolve( dataArr ); 
            });

        } );
    }, // </f: getAll>
    init: () => {
        requester.getAll(['/graph']).then( (resp) => {
            graph.init(resp);
        })
    } // </f: init>
};


//
// 3. the graph object handles webGL graph creation and interaction
//
const graph = {
    options: { /* controlType and renderConfig */ 
        controlType: 'orbit'
    },
    colors: {

    },
    init: function(data){
        var black = 'rgba(0,0,0,1)';
        var grey = 'rgba(200,200,200,1)';
        var myData = {
            nodes:[],
            links:[],
        }
        for(let i = 0; i<data[0].nodes.length;i++){
            myData.nodes[i] = {
                id: data[0].nodes[i].identity.low,
                name: data[0].nodes[i].properties.name,
                label: data[0].nodes[i].labels[0],
            };
        } // nodes
        for(let i = 0; i<data[0].relations.length;i++){
            myData.links[i] = {
                id: data[0].relations[i].identity.low,
                source: data[0].relations[i].start.low,
                target: data[0].relations[i].end.low,
                type: data[0].relations[i].type,
            };
        } // relations


        function getRandomColor() {
          var letters = '0123456789ABCDEF';
          var color = '#';
          for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
          }
          return color;
        }
        let labelCount = data[0].labels.length;
        for(let i = 0; i<data[0].labels.length;i++){
                graph.colors[data[0].labels[i]] = getRandomColor();
        } // labels
        const NODE_REL_SIZE = 4;
        var myGraph = ForceGraph3d(graph.options)(document.getElementById('graph'))
            // general
            .dagMode('bu')
            .dagLevelDistance(100)
            .graphData(myData)
            .backgroundColor('#101020')
            // .backgroundColor('#ffffff')
            // nodes
            .nodeColor( node => graph.colors[node.label] )
            // .nodeAutoColorBy('type')
            // .nodeThreeObjectExtend(true)
            // .nodeThreeObject(node => {
            //     const sprite = new SpriteText(`${node.name}`);
            //     sprite.color = black;
            //     sprite.textHeight = 4;
            //     return sprite;
            // })
            // links
            // .linkColor([grey])
            .linkWidth("1px")
            // particles
            .linkDirectionalParticles(2)
            .linkDirectionalParticleWidth(0.8)
            .linkDirectionalParticleSpeed(0.006)
            .d3Force('collision', d3.forceCollide(node => Math.cbrt(node.size) * NODE_REL_SIZE).radius(10))
            .d3VelocityDecay(0.3);

    } //</f: init>
};



//
// 4. get kicking 
//
window.onload = () => {
    requester.init();
}