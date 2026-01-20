import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

interface TapeMeasureProps {
  value: number; // The decimal value in inches
  height?: number;
  precision?: 16 | 32 | 64; // Precision denominator
}

const TapeMeasure: React.FC<TapeMeasureProps> = ({ value, height = 200, precision = 16 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  
  // Track the current visual center for animation interpolation
  const visualCenterRef = useRef(value);

  // Responsive resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Helper to draw ticks based on a center value
  const drawTicks = useCallback((centerValue: number) => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const layer = svg.select(".ticks-layer");
    
    if (layer.empty()) return;

    // Zoom level adjustment: Show fewer inches if precision is high to avoid clutter
    const pixelsPerInch = precision === 64 ? 280 : precision === 32 ? 200 : 140; 
    const viewWidthInInches = containerWidth / pixelsPerInch;
    const startInches = centerValue - (viewWidthInInches / 2);
    const endInches = centerValue + (viewWidthInInches / 2);

    const scale = d3.scaleLinear()
       .domain([startInches, endInches])
       .range([0, containerWidth]);

    // Generate Tick Data
    const tickData = [];
    const renderStart = Math.floor(startInches - 0.5); 
    const renderEnd = Math.ceil(endInches + 0.5);

    for (let i = renderStart; i <= renderEnd; i++) {
       for (let j = 0; j < precision; j++) {
          const val = i + (j/precision);
          if (val < startInches - 0.5 || val > endInches + 0.5) continue;
          
          let type = 'sub'; // default
          
          if (j === 0) type = 'whole';
          else if (j === precision / 2) type = 'half';
          else if (j % (precision / 4) === 0) type = 'quarter';
          else if (j % (precision / 8) === 0) type = 'eighth';
          else if (j % (precision / 16) === 0) type = '16th';
          else if (precision >= 32 && j % (precision / 32) === 0) type = '32nd';
          else if (precision >= 64) type = '64th';

          tickData.push({ val, type, whole: i });
       }
    }

    // D3 Data Join
    const ticks = layer.selectAll<SVGGElement, any>(".tick-group")
        .data(tickData, (d) => d.val.toFixed(6));

    ticks.exit().remove();

    const enter = ticks.enter().append("g")
        .attr("class", "tick-group");

    // -- Top Ticks --
    enter.append("line")
       .attr("class", "tick-top")
       .attr("stroke", "#a3e635") // Lime-400
       .attr("stroke-linecap", "butt")
       .attr("y1", 0)
       .attr("y2", (d) => {
           if (d.type === 'whole') return height * 0.35;
           if (d.type === 'half') return height * 0.30;
           if (d.type === 'quarter') return height * 0.25;
           if (d.type === 'eighth') return height * 0.20;
           if (d.type === '16th') return height * 0.15;
           if (d.type === '32nd') return height * 0.10;
           return height * 0.07;
       })
       .attr("stroke-width", (d) => {
           if (d.type === 'whole') return 3;
           if (d.type === 'half') return 2;
           if (d.type === 'quarter') return 2;
           if (d.type === 'eighth') return 1.5;
           return 1;
       })
       .attr("opacity", (d) => {
           // Fade out smallest ticks slightly
           if (d.type === '64th') return 0.6;
           return 1;
       });

    // -- Bottom Ticks (Mirrored) --
    enter.append("line")
       .attr("class", "tick-bottom")
       .attr("stroke", "#a3e635") // Lime-400
       .attr("stroke-linecap", "butt")
       .attr("y1", height)
       .attr("y2", (d) => {
           let h = 0;
           if (d.type === 'whole') h = height * 0.35;
           else if (d.type === 'half') h = height * 0.30;
           else if (d.type === 'quarter') h = height * 0.25;
           else if (d.type === 'eighth') h = height * 0.20;
           else if (d.type === '16th') h = height * 0.15;
           else if (d.type === '32nd') h = height * 0.10;
           else h = height * 0.07;
           return height - h;
       })
       .attr("stroke-width", (d) => {
           if (d.type === 'whole') return 3;
           if (d.type === 'half') return 2;
           if (d.type === 'quarter') return 2;
           if (d.type === 'eighth') return 1.5;
           return 1;
       })
       .attr("opacity", (d) => {
          if (d.type === '64th') return 0.6;
          return 1;
       });

    // -- Large Centered Numbers --
    enter.filter(d => d.type === 'whole').append("text")
       .attr("class", "whole-label")
       .attr("text-anchor", "middle")
       .attr("dominant-baseline", "middle")
       .attr("font-family", "JetBrains Mono, monospace")
       .attr("font-weight", "bold")
       .attr("x", 0) 
       .attr("y", height / 2)
       .attr("font-size", "48px")
       .attr("fill", "#bef264") // Lime-300
       .text((d) => d.whole.toString());

    // -- Feet Markers --
    enter.filter(d => d.type === 'whole' && d.whole > 0 && d.whole % 12 === 0).append("rect")
        .attr("x", 32)
        .attr("y", height / 2 - 14)
        .attr("width", 40)
        .attr("height", 28)
        .attr("rx", 4)
        .attr("fill", "#a3e635");

    enter.filter(d => d.type === 'whole' && d.whole > 0 && d.whole % 12 === 0).append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-weight", "bold")
        .attr("x", 52)
        .attr("y", height / 2)
        .attr("font-size", "14px")
        .attr("fill", "#171717")
        .text((d) => `${d.whole/12}F`);

    // MERGE
    ticks.merge(enter)
        .attr("transform", (d) => `translate(${scale(d.val)}, 0)`);

  }, [containerWidth, height, precision]);

  // Initialization
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // 1. Tape Background
    svg.append("rect")
      .attr("width", containerWidth)
      .attr("height", height)
      .attr("fill", "#171717") 
      .attr("stroke", "#262626")
      .attr("stroke-width", 2);

    // 2. Ticks Layer
    svg.append("g").attr("class", "ticks-layer");

    // 3. Glare/Shine
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "tape-shine-dark")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "white").attr("stop-opacity", 0.05);
    gradient.append("stop").attr("offset", "50%").attr("stop-color", "white").attr("stop-opacity", 0);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "black").attr("stop-opacity", 0.3);

    svg.append("rect")
      .attr("width", containerWidth)
      .attr("height", height)
      .attr("fill", "url(#tape-shine-dark)")
      .style("pointer-events", "none");

    // 4. Center Indicator
    const centerX = containerWidth / 2;

    svg.append("line")
      .attr("x1", centerX)
      .attr("y1", 0)
      .attr("x2", centerX)
      .attr("y2", height)
      .attr("stroke", "#ec4899") // Pink-500
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4");

    const indicatorGroup = svg.append("g")
      .attr("transform", `translate(${centerX}, ${height - 2})`);
    
    indicatorGroup.append("path")
      .attr("d", d3.symbol().type(d3.symbolTriangle).size(150))
      .attr("fill", "#ec4899")
      .attr("transform", "rotate(180)");
    
    // Initial draw
    drawTicks(visualCenterRef.current);

  }, [containerWidth, height, drawTicks]);

  // Animation Loop
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.interrupt();

    const startValue = visualCenterRef.current;
    const endValue = value;

    svg.transition()
      .duration(500) // Faster transition for snappier keyboard nudging
      .ease(d3.easeCubicOut)
      .tween("tapeScroll", () => {
        const i = d3.interpolateNumber(startValue, endValue);
        return (t) => {
          const current = i(t);
          visualCenterRef.current = current;
          drawTicks(current);
        };
      });
      
  }, [value, drawTicks]);

  return (
    <div ref={containerRef} className="w-full relative shadow-2xl rounded-lg overflow-hidden border-4 border-neutral-800 bg-neutral-900">
      <svg ref={svgRef} height={height} className="w-full block bg-neutral-900" />
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]"></div>
    </div>
  );
};

export default TapeMeasure;