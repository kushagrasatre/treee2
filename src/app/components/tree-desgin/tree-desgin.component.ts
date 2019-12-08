import { Component, OnInit, Renderer2, ElementRef, AfterContentChecked, ɵConsole } from '@angular/core';
// import * as d3 from 'd3';
declare const d3;
declare const $: any;
import {SearchJsonService} from "../../services/search-json.service"

@Component({
  selector: 'app-tree-desgin',
  templateUrl: './tree-desgin.component.html',
  styleUrls: ['./tree-desgin.component.css']
})
export class TreeDesginComponent implements OnInit, AfterContentChecked {
//counter=0;
leads=[];
treeData={};
public links = [
  ];
  nodes = {};

  width = 960;
  height = 500;

seachData:any;
parentNodeContent:any;
  constructor(private render: Renderer2, private el: ElementRef,private service:SearchJsonService) { 
  }
  svg = d3.select("body").append("svg")
    .attr("width", this.width)
    .attr("height", this.height);
object_array=[];
target_array=[];
source_array=[];
  ngOnInit() {
    this.service.getJson().subscribe(
      (data)=>{
      this.seachData=data;
     this.seachData=this.seachData.plans;
      this.seachData.forEach((element,k) => {
        this.object_array[k]={};
        element.leads.forEach((ele,i) => {
         this.target_array.push(ele.name);
         this.source_array.push(element.name);
         this.links.push({source:element.name,target:ele.name});
        });
      });
      this.links.forEach((link) => {
        link.source = this.nodes[link.source] || (this.nodes[link.source] = { name: link.source });
        link.target = this.nodes[link.target] || (this.nodes[link.target] = { name: link.target });
      });
      this.d3SVGCodeDesgin();
      });

  }


  d3SVGCodeDesgin() {


    const force = d3.layout.force()
      .nodes(d3.values(this.nodes))
      .links(this.links)
      .size([this.width, this.height])
      .linkDistance(60)
      .charge(-400)
      .on("tick", d => {
        path.attr("d", this.linkArc);
        circle.attr("transform", this.transform);
        text.attr("transform", this.transform);
      })
      .start();

    const path = this.svg.append("g").selectAll("path")
      .data(force.links())
      .enter().append("path")
      .attr("class", function (d) { return "link " + d.type; })
      .attr("marker-end", function (d) { return "url(#" + d.type + ")"; });

    const circle = this.svg.append("g").selectAll("circle")
      .data(force.nodes())
      .enter().append("circle")
      .attr("r", 15)
      .attr("class", d => { return 'node ' + d.name})
      .attr("id", d=> { return d.name})
      .call(force.drag)

    const text = this.svg.append("g").selectAll("text")
      .data(force.nodes())
      .enter().append("text")
      .attr("x", 8)
      .attr("y", "1.5rem")
      .text(function (d) { return d.name; });

      this.svg.append("defs").selectAll("marker")
      .data(["suit", "licensing", "resolved"])
      .enter().append("marker")
      .attr("id", function (d) { return d; })
      .attr("viewBox", "0 -5 0 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5");

  }

  linkArc(d) {
    const dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
  }

  transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
  }



  svgCallFunction() {
    let count = 0;
    const svg = d3.select('svg');
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const g = svg.append('g')
      .attr('transform', 'translate(100, 0)')
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', '2');

    const tree = d3.cluster()
      .size([height, width - 200]);

    const stratify = d3.stratify()
      .parentId((d) => d.id.substring(0, d.id.lastIndexOf('.')));
    var root = d3.hierarchy(this.treeData);
    tree(root);
    const link = g.selectAll('.link')
      .data(root.descendants().slice(1))
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', (d) => {
        return 'M' + d.y + ',' + d.x
          + 'C' + (d.parent.y + 100) + ',' + d.x
          + ' ' + (d.parent.y + 100) + ',' + d.parent.x
          + ' ' + d.parent.y + ',' + d.parent.x;
      });

    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('class', (d) => 'node' + (d.children ? ' node--internal' : ' node--leaf'))
      .attr('id', (d) => count++)
      .attr('transform', (d) => {
        return 'translate(' + d.y + ',' + d.x + ')';
      });

    node.append('circle')
      .attr('r', 15)
      .attr('fill', 'black');

    node.append('text')
      .attr('dy', 3)
      .attr('x', (d) => d.children ? -8 : 8)
      .style('text-anchor', (d) => d.children ? 'end' : 'start')
      .text((d) => {
        return d.data.name;
      });
  }

  nameDisplay:any;
  fn(event){
    var newArray = this.seachData.filter(function (el) {
      return el.plan_id == event.currentTarget.value;        
    });
    if(newArray.length<1){
      this.sendDataToCircle('noMatch');
    }
    else{
    this.sendDataToCircle(newArray[0].name);
    }
  }

  ngAfterContentChecked() {
    $('.node').on('click', (e) => {
      e.preventDefault();
      let id=(e.currentTarget.id).slice(1,2)-1;
      this.parentNodeContent=this.seachData[id];
      $('.node').removeClass('active');
      $(e.currentTarget).addClass('active');
    });
if(this.parentNodeContent==undefined){
    $( ".node.p1" ).trigger( "click" );
}
  
  }
  sendDataToCircle(name){
    if(name=="noMatch"){
    $('.node').removeClass('active');
    }
    else{
      $('.node').removeClass('active');
      $('.'+name).addClass('active');
    }
  }
  deleteNode(event){
    this.links=[];
    console.log(this.parentNodeContent.name);
    let id=(this.parentNodeContent.name).slice(1,2)-1;
    this.seachData.splice(id,1);
    console.log(this.seachData);
    this.seachData.forEach((element,k) => {
      this.object_array[k]={};
      element.leads.forEach((ele,i) => {
       //this.target_array.push(ele.name);
       //this.source_array.push(element.name);
      // this.links.push({source:element.name,target:ele.name});
      });
  });
  this.links.forEach((link) => {
    link.source = this.nodes[link.source] || (this.nodes[link.source] = { name: link.source });
    link.target = this.nodes[link.target] || (this.nodes[link.target] = { name: link.target });
  });
  this.d3SVGCodeDesgin();
}
}
