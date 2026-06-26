import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { recalibrateNodeThunk, updateNodeStatusThunk } from '../../store/slices/nodesSlice';
import { addNotification } from '../../store/slices/uiSlice';
import type { SensorNode } from '../../types';
import {
  Activity,
  MapPin,
  Battery,
  Signal,
  RefreshCw,
  Power,
  Workflow,
  Plus,
  Minus,
  RotateCcw,
  TrendingUp,
  Info,
  Terminal
} from 'lucide-react';

interface NodePosition {
  x: number;
  y: number;
}

interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

export default function NetworkTopology() {
  const dispatch = useDispatch<AppDispatch>();
  const nodes = useSelector((state: RootState) => state.nodes.list);
  const activeAlerts = useSelector((state: RootState) => state.alerts.active);
  const user = useSelector((state: RootState) => state.user.currentUser);
  const activeLinks = useSelector((state: RootState) => state.nodes.activeLinks || []);
  const weights = useSelector((state: RootState) => state.nodes.weights || {});
  const routes = useSelector((state: RootState) => state.nodes.routes || {});
  const darkMode = useSelector((state: RootState) => state.ui.darkMode);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>({});
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Zoom & Pan states
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMovedDuringDrag, setHasMovedDuringDrag] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Width and height of SVG canvas
  const width = 800;
  const height = 500;

  // Neighbor discovery constants
  const ADJACENCY_LIST: Record<string, string[]> = {
    'node-01': ['node-02', 'node-03'],
    'node-02': ['node-01', 'node-05', 'node-07'],
    'node-03': ['node-01', 'node-05'],
    'node-04': ['node-06', 'node-08'],
    'node-05': ['node-02', 'node-03', 'node-07', 'node-08'],
    'node-06': ['node-04', 'node-08'],
    'node-07': ['node-02', 'node-05', 'node-08'],
    'node-08': ['node-04', 'node-05', 'node-06', 'node-07']
  };

  const GATEWAY_COORDS = { lat: 18.8021, lng: 98.9215 }; // Node-01 coordinates

  const getDistance = (c1: { lat: number; lng: number }, c2: { lat: number; lng: number }) => {
    if (!c1 || !c2) return 0.05;
    return Math.sqrt(Math.pow(c1.lat - c2.lat, 2) + Math.pow(c1.lng - c2.lng, 2));
  };

  // State for explanation logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const prevNodesRef = useRef<SensorNode[]>([]);
  const prevRoutesRef = useRef<Record<string, string[]>>({});
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Seed initial routing logs
  useEffect(() => {
    const now = new Date();
    const formatTime = (d: Date) => d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setLogs([
      {
        id: '1',
        time: formatTime(new Date(now.getTime() - 600000)),
        message: 'ระบบเริ่มต้นโหมดตรวจสอบหาเส้นทางเครือข่าย Mycelium',
        type: 'info'
      },
      {
        id: '2',
        time: formatTime(new Date(now.getTime() - 500000)),
        message: 'ตรวจพบโหนดเกตเวย์ node-01 เริ่มทำงานเป็นจุดรับข้อมูลกลาง',
        type: 'success'
      },
      {
        id: '3',
        time: formatTime(new Date(now.getTime() - 400000)),
        message: 'สลับเส้นทาง node-06 ออฟไลน์ -> ดำเนินการฟื้นฟูตัวเอง (Self-Healing)',
        type: 'warning'
      }
    ]);
  }, []);

  // Listen to changes in Redux to append decision explanation logs dynamically
  useEffect(() => {
    if (nodes.length === 0) return;
    const formatTime = () => new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLogs: LogEntry[] = [];

    // Compare node status changes
    if (prevNodesRef.current.length > 0) {
      nodes.forEach((node) => {
        const prevNode = prevNodesRef.current.find(n => n.nodeId === node.nodeId);
        if (prevNode) {
          if (prevNode.status === 'active' && node.status !== 'active') {
            newLogs.push({
              id: Math.random().toString(),
              time: formatTime(),
              message: `⚠️ ตรวจพบโหนด ${node.nodeId} ออฟไลน์ / หลุดการเชื่อมต่อหรือล้มเหลว`,
              type: 'danger'
            });
            newLogs.push({
              id: Math.random().toString(),
              time: formatTime(),
              message: `🔄 กำลังเริ่มกระบวนการฟื้นฟูตัวเอง (Self-Healing)... คำนวณเส้นทางหลบหลีกอัตโนมัติ`,
              type: 'warning'
            });
          } else if (prevNode.status !== 'active' && node.status === 'active') {
            newLogs.push({
              id: Math.random().toString(),
              time: formatTime(),
              message: `🟢 โหนด ${node.nodeId} ออนไลน์แล้ว กำลังคำนวณและสลับเชื่อมต่อเข้าเครือข่าย`,
              type: 'success'
            });
          }
        }
      });
    }

    // Compare routes changes
    const routesKeys = Object.keys(routes || {});
    if (routesKeys.length > 0 && Object.keys(prevRoutesRef.current).length > 0) {
      routesKeys.forEach((nodeId) => {
        const prevRoute = prevRoutesRef.current[nodeId];
        const currRoute = routes[nodeId];
        
        if (JSON.stringify(prevRoute) !== JSON.stringify(currRoute)) {
          const prevNextHop = prevRoute?.[1];
          const currNextHop = currRoute?.[1];
          
          if (!currRoute || currRoute.length === 0) {
            newLogs.push({
              id: Math.random().toString(),
              time: formatTime(),
              message: `❌ โหนด ${nodeId} ขาดการเชื่อมต่อไปยังโหนดปลายทาง (Gateway disconnected)`,
              type: 'danger'
            });
          } else if (prevNextHop !== currNextHop) {
            newLogs.push({
              id: Math.random().toString(),
              time: formatTime(),
              message: `🔀 สลับ Next Hop สำหรับ ${nodeId}: จาก ${prevNextHop || 'ไม่มี'} เป็น ${currNextHop}`,
              type: 'info'
            });
            
            const nextHopNode = nodes.find(n => n.nodeId === currNextHop);
            if (nextHopNode) {
              if (nextHopNode.battery < 30) {
                newLogs.push({
                  id: Math.random().toString(),
                  time: formatTime(),
                  message: `⚠️ ข้อควรระวัง: เลือกใช้ ${currNextHop} เพื่อกู้คืนการทำงาน แม้ระดับแบตเตอรี่จะค่อนข้างต่ำ (${nextHopNode.battery}%)`,
                  type: 'warning'
                });
              } else {
                newLogs.push({
                  id: Math.random().toString(),
                  time: formatTime(),
                  message: `✅ เลือกเชื่อมต่อผ่าน ${currNextHop} เนื่องจากค่าน้ำหนักถ่วงรวมดีที่สุด (แบตเตอรี่: ${nextHopNode.battery}%, RSSI: ${nextHopNode.rssi} dBm)`,
                  type: 'success'
                });
              }
            }
          }
        }
      });
    }

    if (newLogs.length > 0) {
      setLogs((prev) => [...prev, ...newLogs].slice(-30));
    }

    prevNodesRef.current = nodes;
    prevRoutesRef.current = routes || {};
  }, [nodes, routes]);

  // Register non-passive wheel event listener for zoom behavior (centered on cursor)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Convert mouse positions to SVG coordinate space
      const svgX = (mouseX / rect.width) * width;
      const svgY = (mouseY / rect.height) * height;

      const zoomIntensity = 0.05;
      const delta = e.deltaY < 0 ? 1 : -1;

      setScale((prevScale) => {
        const nextScale = Math.max(0.5, Math.min(5, prevScale + delta * zoomIntensity));

        setOffset((prevOffset) => {
          const scaleRatio = nextScale / prevScale;
          const nextOffsetX = svgX - (svgX - prevOffset.x) * scaleRatio;
          const nextOffsetY = svgY - (svgY - prevOffset.y) * scaleRatio;
          return { x: nextOffsetX, y: nextOffsetY };
        });

        return nextScale;
      });
    };

    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      svg.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return; // Only pan on left click
    setIsDragging(true);
    setHasMovedDuringDrag(false);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - offset.x - dragStart.x;
    const dy = e.clientY - offset.y - dragStart.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setHasMovedDuringDrag(true);
    }
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale((prevScale) => {
      const nextScale = Math.min(5, prevScale + 0.2);
      setOffset((prevOffset) => {
        const scaleRatio = nextScale / prevScale;
        const nextOffsetX = (width / 2) - ((width / 2) - prevOffset.x) * scaleRatio;
        const nextOffsetY = (height / 2) - ((height / 2) - prevOffset.y) * scaleRatio;
        return { x: nextOffsetX, y: nextOffsetY };
      });
      return nextScale;
    });
  };

  const handleZoomOut = () => {
    setScale((prevScale) => {
      const nextScale = Math.max(0.5, prevScale - 0.2);
      setOffset((prevOffset) => {
        const scaleRatio = nextScale / prevScale;
        const nextOffsetX = (width / 2) - ((width / 2) - prevOffset.x) * scaleRatio;
        const nextOffsetY = (height / 2) - ((height / 2) - prevOffset.y) * scaleRatio;
        return { x: nextOffsetX, y: nextOffsetY };
      });
      return nextScale;
    });
  };

  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Initialize geographical mapping positions
  useEffect(() => {
    if (nodes.length === 0) return;

    // Define Chiang Mai Doi Suthep bounding coordinates
    const minLat = 18.790;
    const maxLat = 18.815;
    const minLng = 98.910;
    const maxLng = 98.960;

    const initialPositions: Record<string, NodePosition> = {};

    nodes.forEach((node) => {
      // Scale lat/lng to canvas width/height
      const x = ((node.location.lng - minLng) / (maxLng - minLng)) * (width - 160) + 80;
      const y = height - (((node.location.lat - minLat) / (maxLat - minLat)) * (height - 160) + 80);
      initialPositions[node.nodeId] = { x, y };
    });

    setNodePositions(initialPositions);
  }, [nodes]);

  // Action: Recalibrate Node
  const handleRecalibrate = async (nodeId: string) => {
    setIsCalibrating(true);
    try {
      await dispatch(recalibrateNodeThunk(nodeId)).unwrap();
      dispatch(addNotification({ message: `ปรับเทียบเซนเซอร์ของโหนด ${nodeId} สำเร็จแล้ว`, type: 'success' }));
    } catch (err: any) {
      dispatch(addNotification({ message: err || 'การปรับเทียบเซนเซอร์ล้มเหลว', type: 'error' }));
    } finally {
      setIsCalibrating(false);
    }
  };

  // Action: Toggle Node Status
  const handleToggleStatus = async (node: SensorNode) => {
    if (node.battery <= 0) {
      dispatch(addNotification({ message: 'ไม่สามารถเปิดทำงานโหนดที่แบตเตอรี่หมดได้', type: 'error' }));
      return;
    }
    const nextStatus = node.status === 'active' ? 'inactive' : 'active';
    try {
      await dispatch(updateNodeStatusThunk({ nodeId: node.nodeId, status: nextStatus })).unwrap();
      dispatch(addNotification({
        message: `อัปเดตสถานะโหนด ${node.nodeId} เป็น ${nextStatus === 'active' ? 'เปิดทำงาน' : 'ปิดทำงาน'} เรียบร้อยแล้ว`,
        type: 'success'
      }));
    } catch (err: any) {
      dispatch(addNotification({ message: err || 'การอัปเดตสถานะเซนเซอร์ล้มเหลว', type: 'error' }));
    }
  };

  const selectedNodeObj = nodes.find(n => n.nodeId === selectedNodeId);

  // Helper to get formatted path representation
  const getPathString = (nodeId: string) => {
    const path = routes[nodeId];
    if (!path || path.length === 0) return 'ขาดการเชื่อมต่อ';
    return path.join(' ➔ ');
  };

  // Calculations for selected node formulas
  let formulaDetails = null;
  let neighborsDetails: Array<{ id: string; rssi: number; lqi: number; distance: number; weight: number; status: string }> = [];

  // Larger node sizes (radius base = 9, multiplier = 4)
  const getNodeRadius = (battery: number) => {
    return 9 + (battery / 100) * 4;
  };

  if (selectedNodeObj) {
    const isGateway = selectedNodeObj.nodeId === 'node-01';
    
    if (!isGateway) {
      // Euclidean distance to Gateway coords
      const dist = getDistance(selectedNodeObj.location, GATEWAY_COORDS);
      const eResidual = Math.max(0, Math.min(100, selectedNodeObj.battery)) / 100;
      const batteryWeight = 0.5 * eResidual;

      const rssiVal = selectedNodeObj.rssi || -75;
      const rssiReliability = Math.max(0, Math.min(1, (rssiVal + 100) / 70));
      const rssiWeight = 0.3 * rssiReliability;

      const proximity = 1 / (1 + dist * 10);
      const proximityWeight = 0.2 * proximity;

      const calculatedTotalWeight = batteryWeight + rssiWeight + proximityWeight;

      // Determine dominant factor
      let dominant = 'battery';
      let dominantLabel = 'พลังงานแบตเตอรี่คงเหลือ (α)';
      let dominantValue = batteryWeight;

      if (rssiWeight > dominantValue) {
        dominant = 'rssi';
        dominantLabel = 'คุณภาพสัญญาณ RSSI (β)';
        dominantValue = rssiWeight;
      }
      if (proximityWeight > dominantValue) {
        dominant = 'distance';
        dominantLabel = 'ความใกล้ชิดเกตเวย์ (γ)';
      }

      formulaDetails = {
        eResidual,
        batteryWeight,
        rssiVal,
        rssiReliability,
        rssiWeight,
        proximity,
        proximityWeight,
        total: calculatedTotalWeight,
        dominant,
        dominantLabel
      };
    }

    // Neighbors details mapping
    const neighborsList = ADJACENCY_LIST[selectedNodeObj.nodeId] || [];
    neighborsDetails = neighborsList.map((nId) => {
      const nNode = nodes.find(n => n.nodeId === nId);
      const dist = nNode ? getDistance(selectedNodeObj.location, nNode.location) * 1000 : 999; // approx meters
      const isNextHop = routes[selectedNodeObj.nodeId]?.[1] === nId;
      
      let status = 'candidate';
      if (!nNode || nNode.status === 'dead' || nNode.status === 'inactive' || nNode.battery <= 0) {
        status = 'offline';
      } else if (isNextHop) {
        status = 'nexthop';
      }

      return {
        id: nId,
        rssi: nNode?.rssi || -100,
        lqi: nNode?.lqi || 0,
        distance: Math.round(dist),
        weight: weights[nId] || 0,
        status
      };
    });
  }

  return (
    <div className="px-6 space-y-6">

      {/* Topology Header Panel */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-surface border-border-main">
        <div>
          <h2 className="text-base font-bold text-text-main flex items-center gap-2">
            <Workflow className="text-primary-500" size={20} />
            แผงควบคุมและแผนผังเครือข่ายหาเส้นทาง Mycelium
          </h2>
          <p className="text-xs text-text-sub mt-0.5">
            จำลองและแสดงผลการหาเส้นทางส่งต่อข้อมูลแบบฟื้นฟูตัวเอง (Self-Healing) ตามค่าน้ำหนักเชิงชีวภาพจริง
          </p>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas & Information Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Network SVG Canvas panel */}
        <div className="glass-panel rounded-3xl p-5 lg:col-span-2 relative overflow-hidden flex flex-col items-center bg-bg-surface-elevated/20 border-border-main">

          {/* Canvas Legend */}
          <div className="absolute top-4 left-4 bg-bg-surface/90 border border-border-main rounded-2xl p-4 flex flex-col gap-2 text-xs text-text-sub backdrop-blur-md z-10 shadow-md">
            <span className="font-bold text-text-main mb-0.5">คำอธิบายสถานะ</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>ออนไลน์ปกติ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>แบตเตอรี่ต่ำ (&lt; 30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
              <span>ออฟไลน์ / ตรวจพบไฟไหม้</span>
            </div>
            <div className="border-t border-border-main my-1 pt-1.5 font-bold text-text-main">ลิงก์เส้นทางวิทยุ</div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-emerald-500"></span>
              <span>เส้นทางหลัก (Primary Path)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 border-t border-dashed border-amber-500"></span>
              <span>เส้นทางสำรอง (Backup Path)</span>
            </div>
          </div>

          {/* Zoom/Pan Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 rounded-2xl bg-bg-surface border border-border-main text-text-main hover:bg-bg-surface-elevated transition-colors flex items-center justify-center shadow-sm focus:outline-none cursor-pointer"
              title="Zoom In"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 rounded-2xl bg-bg-surface border border-border-main text-text-main hover:bg-bg-surface-elevated transition-colors flex items-center justify-center shadow-sm focus:outline-none cursor-pointer"
              title="Zoom Out"
            >
              <Minus size={18} />
            </button>
            <button
              onClick={handleReset}
              className="w-10 h-10 rounded-2xl bg-bg-surface border border-border-main text-text-main hover:bg-bg-surface-elevated transition-colors flex items-center justify-center shadow-sm focus:outline-none cursor-pointer"
              title="Reset View"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* SVG Map Canvas */}
          {nodes.length === 0 ? (
            <div className="w-full aspect-[8/5] flex items-center justify-center text-text-muted text-sm font-semibold">
              ไม่มีข้อมูลโหนดสำหรับแสดงโครงข่าย
            </div>
          ) : (
            <svg
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className={`w-full aspect-[8/5] select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              {/* Reusable definitions for glow and arrowheads */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path 
                    d="M 40 0 L 0 0 0 40" 
                    fill="none" 
                    stroke={darkMode ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.02)"} 
                    strokeWidth="1" 
                  />
                </pattern>
                
                {/* Arrowhead marker definition (Single ID to prevent duplicates) */}
                <marker
                  id="arrow-head-primary"
                  viewBox="0 0 10 10"
                  refX="25" // shifted further away to accommodate larger node circles
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
                </marker>
                
                <marker
                  id="arrow-head-backup"
                  viewBox="0 0 10 10"
                  refX="25"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
                </marker>

                {/* SVG Glow Filter (lightweight and nice) */}
                <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Transform Group for Zoom & Pan */}
              <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>


                {/* 1. Draw Mesh connections */}
                {activeLinks.map((link, idx) => {
                  const p1 = nodePositions[link.source];
                  const p2 = nodePositions[link.target];
                  if (!p1 || !p2) return null;

                  const node1 = nodes.find(n => n.nodeId === link.source);
                  const node2 = nodes.find(n => n.nodeId === link.target);

                  const isDisconnected = !node1 || !node2 || node1.status === 'dead' || node2.status === 'dead' || node1.status === 'inactive' || node2.status === 'inactive' || node1.battery <= 0 || node2.battery <= 0;
                  const averageRSSI = node1 && node2 ? (node1.rssi + node2.rssi) / 2 : -100;

                  let strokeColor = 'rgba(16, 185, 129, 0.65)'; // primary green
                  if (isDisconnected) {
                    strokeColor = 'rgba(239, 68, 68, 0.2)'; // offline link
                  } else if (link.type === 'backup') {
                    strokeColor = 'rgba(245, 158, 11, 0.65)'; // backup amber
                  } else if (averageRSSI < -75) {
                    strokeColor = 'rgba(245, 158, 11, 0.65)';
                  }

                  const isHighlighted = selectedNodeId === link.source || selectedNodeId === link.target;

                  return (
                    <g key={`link-${idx}`}>
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={strokeColor}
                        strokeWidth={isHighlighted ? 4.5 : 2.5}
                        strokeDasharray={link.type === 'backup' ? '5,5' : undefined}
                        markerEnd={link.type === 'primary' ? 'url(#arrow-head-primary)' : 'url(#arrow-head-backup)'}
                        filter={link.type === 'primary' && !isDisconnected ? 'url(#glow-effect)' : undefined}
                        className="transition-all duration-300"
                      />
                      {/* 4. Draw packet flow animation circles along active primary links */}
                      {!isDisconnected && link.type === 'primary' && (
                        <circle r="5.5" fill="#34d399" filter="url(#glow-effect)">
                          <animateMotion
                            dur="3s"
                            repeatCount="indefinite"
                            path={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}

                {/* 2. Draw Sensor Nodes */}
                {nodes.map((node) => {
                  const pos = nodePositions[node.nodeId];
                  if (!pos) return null;

                  const isGateway = node.nodeId === 'node-01';

                  const hasAlert = activeAlerts.some(
                    a => a.sourceNodeId === node.nodeId && a.severity === 'critical'
                  );

                  const isOffline = node.status === 'dead' || node.status === 'inactive' || node.battery <= 0;
                  const isLowBattery = node.battery < 30;

                  let ringColor = 'rgba(16, 185, 129, 0.25)';
                  let circleColor = '#10b981'; // Green active

                  if (isOffline) {
                    circleColor = '#9ca3af'; // Gray offline
                    ringColor = 'rgba(156, 163, 175, 0.2)';
                  } else if (hasAlert) {
                    circleColor = '#ef4444'; // Red fire alert
                    ringColor = 'rgba(239, 68, 68, 0.5)';
                  } else if (isLowBattery) {
                    circleColor = '#f59e0b'; // Amber low battery
                    ringColor = 'rgba(245, 158, 11, 0.4)';
                  }

                  const isSelected = selectedNodeId === node.nodeId;
                  const radius = getNodeRadius(node.battery);

                  // Render Gateway (node-01) with custom structure and transmitter animations
                  if (isGateway) {
                    return (
                      <g
                        key={node.nodeId}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!hasMovedDuringDrag) {
                            setSelectedNodeId(node.nodeId);
                          }
                        }}
                        className="cursor-pointer group"
                      >
                        {/* Pulsing Signal Wave Animations */}
                        <circle cx="0" cy="-10" r="5" fill="none" stroke="#10b981" strokeWidth="1.5">
                          <animate attributeName="r" values="5;20" dur="2.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0" dur="2.5s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="0" cy="-10" r="5" fill="none" stroke="#10b981" strokeWidth="1.5">
                          <animate attributeName="r" values="5;30" dur="2.5s" begin="1.25s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0" dur="2.5s" begin="1.25s" repeatCount="indefinite" />
                        </circle>

                        {/* Selection Highlight Ring */}
                        <circle
                          cx="0"
                          cy="0"
                          r="18"
                          fill="none"
                          stroke={isSelected ? '#3b82f6' : 'transparent'}
                          strokeWidth="2.5"
                          className="transition-all duration-300"
                        />

                        {/* Radio Tower Base Structure */}
                        <polygon
                          points="-10,12 10,12 0,-10"
                          fill={darkMode ? "#047857" : "#a7f3d0"}
                          stroke="#10b981"
                          strokeWidth="2.5"
                          filter="url(#glow-effect)"
                        />
                        {/* Antenna Transmitter Tip */}
                        <circle cx="0" cy="-10" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />

                        {/* Gateway Text Badge */}
                        <text
                          y={23}
                          textAnchor="middle"
                          fill="#10b981"
                          className="text-[10px] font-mono font-bold uppercase tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                        >
                          GATEWAY
                        </text>
                        <text
                          y={-17}
                          textAnchor="middle"
                          fill={isSelected ? '#3b82f6' : (darkMode ? '#ffffff' : '#111827')}
                          className="text-xs font-mono font-bold tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                        >
                          {node.nodeId}
                        </text>
                      </g>
                    );
                  }

                  return (
                    <g
                      key={node.nodeId}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!hasMovedDuringDrag) {
                          setSelectedNodeId(node.nodeId);
                        }
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Pulsing ring for nodes in active fire alert state or selection */}
                      {(hasAlert || isSelected) && (
                        <circle
                          r={radius}
                          fill="none"
                          stroke={hasAlert ? '#ef4444' : '#3b82f6'}
                          strokeWidth="2"
                        >
                          <animate
                            attributeName="r"
                            values={`${radius};${radius + 15}`}
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.8;0"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}

                      {/* Outer selection ring */}
                      <circle
                        r={radius + 4}
                        fill="none"
                        stroke={isSelected ? '#3b82f6' : ringColor}
                        strokeWidth={isSelected ? 2.5 : 1.2}
                        className="transition-all duration-300 group-hover:scale-110"
                      />

                      {/* Core Node Circle */}
                      <circle
                        r={radius}
                        fill={circleColor}
                        filter={!isOffline ? "url(#glow-effect)" : undefined}
                        className="transition-all duration-300"
                      />

                      {/* Node Label Text */}
                      <text
                        y={-radius - 8}
                        textAnchor="middle"
                        fill={isSelected ? '#3b82f6' : (darkMode ? '#ffffff' : '#111827')}
                        className="text-xs font-mono font-bold tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                      >
                        {node.nodeId}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          )}
        </div>

        {/* Selected Node Details Card / Sidebar */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between min-h-[350px] bg-bg-surface border-border-main animate-fade-in">
          {selectedNodeObj ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">

              {/* Header: Node Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-text-main font-mono">{selectedNodeObj.nodeId}</span>
                  {selectedNodeObj.status === 'active' ? (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      ออนไลน์
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-bg-surface-elevated text-text-muted border border-border-main">
                      ออฟไลน์
                    </span>
                  )}
                </div>

                <p className="text-sm text-text-sub flex items-center gap-1.5 font-semibold">
                  <MapPin size={14} className="text-emerald-500" />
                  {selectedNodeObj.metadata?.location_name || 'จุดเฝ้าระวังพื้นที่ป่า'}
                </p>
                <span className="text-xs text-text-muted font-mono font-semibold block">
                  พิกัดตำแหน่ง: {selectedNodeObj.location.lat.toFixed(5)}, {selectedNodeObj.location.lng.toFixed(5)}
                </span>
              </div>

              {/* Metrics gauges */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-bg-surface-elevated/40 border border-border-main rounded-2xl p-4">
                  <span className="text-[10px] font-mono font-bold text-text-muted uppercase">อุณหภูมิ</span>
                  <div className="text-sm font-extrabold text-text-main mt-1">
                    {selectedNodeObj.status === 'dead' ? '—' : `${selectedNodeObj.sensors.temp.toFixed(1)}°C`}
                  </div>
                </div>

                <div className="bg-bg-surface-elevated/40 border border-border-main rounded-2xl p-4">
                  <span className="text-[10px] font-mono font-bold text-text-muted uppercase">ความหนาแน่นควัน</span>
                  <div className="text-sm font-extrabold text-text-main mt-1">
                    {selectedNodeObj.status === 'dead' ? '—' : `${selectedNodeObj.sensors.smoke} ppm`}
                  </div>
                </div>

                <div className="bg-bg-surface-elevated/40 border border-border-main rounded-2xl p-4">
                  <span className="text-[10px] font-mono font-bold text-text-muted uppercase">ความชื้น</span>
                  <div className="text-sm font-extrabold text-text-main mt-1">
                    {selectedNodeObj.status === 'dead' ? '—' : `${selectedNodeObj.sensors.humidity.toFixed(0)}%`}
                  </div>
                </div>

                <div className="bg-bg-surface-elevated/40 border border-border-main rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-mono font-bold text-text-muted uppercase">ระดับแบตเตอรี่</span>
                  <div className="text-sm font-extrabold text-text-main mt-1 flex items-center gap-1.5">
                    <Battery size={15} className={selectedNodeObj.battery < 20 ? 'text-red-500 animate-pulse' : 'text-emerald-500'} />
                    {selectedNodeObj.battery}%
                  </div>
                </div>
              </div>

              {/* Link Details */}
              <div className="space-y-3 border-t border-border-main pt-5">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">สัญญาณวิทยุเชื่อมต่อ</span>
                <div className="flex justify-between text-sm font-mono text-text-sub font-semibold">
                  <span className="flex items-center gap-1.5"><Signal size={14} /> RSSI</span>
                  <span className="text-text-main">{selectedNodeObj.status === 'dead' ? '—' : `${selectedNodeObj.rssi} dBm`}</span>
                </div>
                <div className="flex justify-between text-sm font-mono text-text-sub font-semibold">
                  <span className="flex items-center gap-1.5"><Activity size={14} /> คุณภาพสัญญาณ (LQI)</span>
                  <span className="text-text-main">{selectedNodeObj.status === 'dead' ? '—' : `${selectedNodeObj.lqi} / 255`}</span>
                </div>
              </div>

              {/* Mycelium Weight Details */}
              <div className="space-y-3 border-t border-border-main pt-5">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">ระบบหาเส้นทาง Mycelium</span>
                <div className="flex justify-between text-sm font-mono text-text-sub font-semibold">
                  <span className="flex items-center gap-1.5"><Workflow size={14} className="text-primary-500" /> ค่าน้ำหนักตัดสินใจ (Weight)</span>
                  <span className="text-primary-600 dark:text-primary-400 font-extrabold text-base">
                    {weights && weights[selectedNodeObj.nodeId]
                      ? weights[selectedNodeObj.nodeId].toFixed(3)
                      : (selectedNodeObj.status === 'active' ? '0.740' : '0.000')}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Calibrate/Toggle */}
              {user && (user.role === 'admin' || user.role === 'ranger') ? (
                <div className="flex gap-3 border-t border-border-main pt-5 mt-auto animate-fade-in">
                  <button
                    disabled={isCalibrating || selectedNodeObj.status === 'dead'}
                    onClick={() => handleRecalibrate(selectedNodeObj.nodeId)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-xs font-bold bg-bg-surface hover:bg-bg-surface-elevated text-text-main border border-border-main transition-colors disabled:opacity-50 focus:outline-none cursor-pointer"
                  >
                    <RefreshCw className={isCalibrating ? 'animate-spin' : ''} size={14} />
                    {isCalibrating ? 'ปรับเทียบ...' : 'ปรับเทียบใหม่'}
                  </button>

                  <button
                    disabled={selectedNodeObj.battery <= 0}
                    onClick={() => handleToggleStatus(selectedNodeObj)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-xs font-bold text-white transition-colors focus:outline-none cursor-pointer ${selectedNodeObj.status === 'active'
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-emerald-500 hover:bg-emerald-600'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <Power size={14} />
                    {selectedNodeObj.battery <= 0 
                      ? 'แบตเตอรี่หมด' 
                      : (selectedNodeObj.status === 'active' ? 'ปิดทำงาน' : 'เปิดทำงาน')}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-bg-surface-elevated/40 border border-border-main rounded-xl text-xs text-text-muted leading-normal mt-4">
                  🔒 เข้าสู่ระบบในฐานะเจ้าหน้าที่หรือผู้ดูแลระบบเพื่อแก้ไขค่าอุปกรณ์
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center my-auto space-y-4">
              <Workflow className="text-text-muted" size={40} />
              <div className="text-sm text-text-main font-bold">เลือกโหนดเพื่อตรวจสอบ</div>
              <p className="text-xs text-text-sub max-w-[220px] leading-relaxed font-semibold">
                คลิกที่จุดโหนดเซนเซอร์บนแผนที่เพื่อดูข้อมูลค่าเซนเซอร์ พิกัด และคุณภาพสัญญาณแบบสด
              </p>
            </div>
          )}
        </div>

      </div>

      {/* BOTTOM SECTION: MYCELIUM ROUTING PARADIGMS & EXPLAINER FEED (RE-ARRANGED WIDE LAYOUT) */}
      <div className="space-y-6">

        {/* ROW 1: Wide Routing Table View (For clarity and no squeezing) */}
        <div className="glass-panel rounded-3xl p-6 bg-bg-surface border-border-main shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-5">
            <Workflow className="text-primary-500 animate-pulse" size={18} />
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
              ตารางเส้นทางการเชื่อมต่อระบบหาเส้นทาง Mycelium (Routing Path Table)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border-main/60 text-text-muted font-bold">
                  <th className="pb-3 pl-1 text-sm">โหนดต้นทาง</th>
                  <th className="pb-3 text-sm">เส้นทางจัดลำดับหลัก (Primary Path)</th>
                  <th className="pb-3 text-sm">โหนดถัดไป (Next Hop)</th>
                  <th className="pb-3 text-center text-sm">ค่าน้ำหนักตัดสินใจ</th>
                  <th className="pb-3 text-right pr-1 text-sm">สถานะเส้นทาง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30 text-text-sub font-semibold font-mono">
                {nodes.filter(n => n.nodeId !== 'node-01').map((node) => {
                  const hasPath = routes[node.nodeId] && routes[node.nodeId].length > 0;
                  const nextHop = routes[node.nodeId]?.[1] || '—';
                  const weightVal = weights[node.nodeId] ? weights[node.nodeId].toFixed(4) : '0.0000';
                  const isOffline = node.status === 'dead' || node.status === 'inactive' || node.battery <= 0;
                  
                  let statusLabel = 'ปกติ';
                  let statusClass = 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20';

                  if (isOffline) {
                    statusLabel = 'ออฟไลน์';
                    statusClass = 'text-text-muted bg-bg-surface-elevated border border-border-main';
                  } else if (!hasPath) {
                    statusLabel = 'ตัดการเชื่อมต่อ';
                    statusClass = 'text-red-500 bg-red-500/10 border border-red-500/20';
                  } else {
                    // Check if self-healing bypassed any inactive nodes
                    const inactiveNodes = nodes.filter(n => n.status !== 'active').map(n => n.nodeId);
                    const hasSelfHealed = routes[node.nodeId].some((step: string) => inactiveNodes.includes(step) === false) && inactiveNodes.length > 0;
                    if (hasSelfHealed) {
                      statusLabel = 'ฟื้นฟูตัวเองสำเร็จ';
                      statusClass = 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
                    }
                  }

                  return (
                    <tr 
                      key={node.nodeId} 
                      onClick={() => setSelectedNodeId(node.nodeId)}
                      className={`hover:bg-bg-surface-elevated/40 cursor-pointer transition-colors ${selectedNodeId === node.nodeId ? 'bg-bg-surface-elevated/65' : ''}`}
                    >
                      <td className="py-4 font-bold text-text-main pl-1 text-sm">{node.nodeId}</td>
                      <td className="py-4 text-sm text-text-main font-bold">
                        {isOffline ? (
                          <span className="text-text-muted font-normal">อุปกรณ์ปิดการทำงาน</span>
                        ) : (
                          <span className="flex items-center gap-1">
                            {getPathString(node.nodeId)}
                          </span>
                        )}
                      </td>
                      <td className="py-4 font-bold text-text-main text-sm">{isOffline ? '—' : nextHop}</td>
                      <td className="py-4 text-center text-primary-600 dark:text-primary-400 font-extrabold text-sm">{isOffline ? '0.0000' : weightVal}</td>
                      <td className="py-4 text-right pr-1">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROW 2: Two Columns Grid for formulas/neighbors (left) and live explanations (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Selected Node Details: Formula & Neighbors (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            {selectedNodeObj ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                
                {/* Weight calculation step-by-step formula */}
                <div className="glass-panel rounded-3xl p-6 bg-bg-surface border-border-main flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="text-primary-500" size={18} />
                        <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">
                          สูตรถ่วงน้ำหนัก Mycelium (Weight Formula Details)
                        </h4>
                      </div>
                    </div>

                    {selectedNodeObj.nodeId === 'node-01' ? (
                      <div className="flex items-center gap-2 p-5 bg-bg-surface-elevated/30 border border-border-main rounded-2xl my-auto text-sm text-text-sub">
                        <Info size={16} className="text-primary-500" />
                        <span>โหนดเกตเวย์กลาง (Gateway node) ทำหน้าที่รับข้อมูลโดยตรง ไม่จำเป็นต้องคำนวณสูตรหาเส้นทางส่งต่อ</span>
                      </div>
                    ) : formulaDetails ? (
                      <div className="space-y-4">
                        {/* Formula display */}
                        <div className="bg-bg-surface-elevated/50 border border-border-main p-4 rounded-2xl text-center">
                          <span className="text-xs text-text-muted font-mono block mb-1">สมการถ่วงน้ำหนักรวม</span>
                          <div className="text-sm font-mono font-extrabold text-primary-600 dark:text-primary-400">
                            W = (0.5 × E) + (0.3 × R) + (0.2 × D)
                          </div>
                        </div>

                        {/* Calculations breakdown */}
                        <div className="space-y-2.5">
                          {/* Battery */}
                          <div className={`p-3.5 border rounded-2xl flex items-center justify-between transition-all ${formulaDetails.dominant === 'battery' ? 'border-emerald-500/40 bg-emerald-500/5 shadow-sm' : 'border-border-main bg-bg-surface-elevated/20'}`}>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-text-main flex items-center gap-1">
                                <Battery size={13} className="text-emerald-500" />
                                แบตเตอรี่ E_residual (α = 0.5)
                              </span>
                              <span className="text-[11px] text-text-muted font-mono font-semibold">{selectedNodeObj.battery}% ➔ ค่าส่วนแบ่ง: {formulaDetails.eResidual.toFixed(2)}</span>
                            </div>
                            <span className="text-sm font-mono font-bold text-text-main">
                              +{formulaDetails.batteryWeight.toFixed(3)}
                            </span>
                          </div>

                          {/* RSSI */}
                          <div className={`p-3.5 border rounded-2xl flex items-center justify-between transition-all ${formulaDetails.dominant === 'rssi' ? 'border-blue-500/40 bg-blue-500/5 shadow-sm' : 'border-border-main bg-bg-surface-elevated/20'}`}>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-text-main flex items-center gap-1">
                                <Signal size={13} className="text-blue-500" />
                                สัญญาณ RSSI_reliability (β = 0.3)
                              </span>
                              <span className="text-[11px] text-text-muted font-mono font-semibold">{formulaDetails.rssiVal} dBm ➔ ค่าส่วนแบ่ง: {formulaDetails.rssiReliability.toFixed(2)}</span>
                            </div>
                            <span className="text-sm font-mono font-bold text-text-main">
                              +{formulaDetails.rssiWeight.toFixed(3)}
                            </span>
                          </div>

                          {/* Distance */}
                          <div className={`p-3.5 border rounded-2xl flex items-center justify-between transition-all ${formulaDetails.dominant === 'distance' ? 'border-purple-500/40 bg-purple-500/5 shadow-sm' : 'border-border-main bg-bg-surface-elevated/20'}`}>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-text-main flex items-center gap-1">
                                <MapPin size={13} className="text-purple-500" />
                                ความใกล้ชิด D_proximity (γ = 0.2)
                              </span>
                              <span className="text-[11px] text-text-muted font-mono font-semibold">ระยะทางภูมิศาสตร์ ➔ ค่าส่วนแบ่ง: {formulaDetails.proximity.toFixed(2)}</span>
                            </div>
                            <span className="text-sm font-mono font-bold text-text-main">
                              +{formulaDetails.proximityWeight.toFixed(3)}
                            </span>
                          </div>
                        </div>

                        {/* Sum Result */}
                        <div className="border-t border-border-main pt-4 flex justify-between items-center">
                          <span className="text-xs font-bold text-text-sub">ค่าน้ำหนักสุทธิที่คำนวณได้ (W_total)</span>
                          <span className="text-base font-mono font-extrabold text-primary-500">
                            {formulaDetails.total.toFixed(4)}
                          </span>
                        </div>

                        {/* Dominant factor tag */}
                        <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center gap-2">
                          <span className="text-[10px] bg-primary-500 text-white font-extrabold px-2 py-0.5 rounded uppercase leading-none">
                            ปัจจัยหลัก
                          </span>
                          <span className="text-xs text-text-main font-semibold leading-none">
                            ถูกควบคุมหลักโดย: <span className="font-bold text-primary-600 dark:text-primary-400">{formulaDetails.dominantLabel}</span>
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Neighbors list / discovery table */}
                <div className="glass-panel rounded-3xl p-6 bg-bg-surface border-border-main flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <Signal className="text-primary-500" size={18} />
                        <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">
                          ตารางโหนดเพื่อนบ้าน (Neighbor Table)
                        </h4>
                      </div>
                      <span className="text-xs font-mono text-text-muted">
                        ค้นพบ: {neighborsDetails.length} โหนด
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left font-mono">
                        <thead>
                          <tr className="border-b border-border-main text-text-muted font-bold">
                            <th className="pb-2.5">ID เพื่อนบ้าน</th>
                            <th className="pb-2.5">RSSI/LQI</th>
                            <th className="pb-2.5">ระยะทาง (ม.)</th>
                            <th className="pb-2.5">น้ำหนักโหนด</th>
                            <th className="pb-2.5 text-right">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-main/40 text-text-sub font-bold">
                          {neighborsDetails.map((nb) => {
                            let badgeClass = 'text-text-muted bg-bg-surface-elevated border border-border-main';
                            let badgeText = 'ผู้สมัคร';

                            if (nb.status === 'offline') {
                              badgeText = 'ออฟไลน์';
                              badgeClass = 'text-red-500 bg-red-500/10 border border-red-500/20';
                            } else if (nb.status === 'nexthop') {
                              badgeText = 'Next Hop';
                              badgeClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30';
                            }

                            return (
                              <tr key={nb.id} className="hover:bg-bg-surface-elevated/20">
                                <td className="py-3 text-text-main font-bold text-sm">{nb.id}</td>
                                <td className="py-3 text-sm">
                                  {nb.status === 'offline' ? '—' : `${nb.rssi}dBm / ${nb.lqi}`}
                                </td>
                                <td className="py-3 text-sm">{nb.status === 'offline' ? '—' : `${nb.distance} ม.`}</td>
                                <td className="py-3 text-primary-500 font-extrabold text-sm">{nb.status === 'offline' ? '0.00' : nb.weight.toFixed(3)}</td>
                                <td className="py-3 text-right">
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${badgeClass}`}>
                                    {badgeText}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="glass-panel rounded-3xl p-8 bg-bg-surface border-border-main flex items-center justify-center gap-3 text-sm text-text-muted font-bold animate-pulse min-h-[300px]">
                <Info size={18} />
                <span>คลิกเลือกโหนดเซนเซอร์บนแผนผังด้านบน เพื่อเรียกดูตารางเพื่อนบ้านและสูตรคำนวณถ่วงน้ำหนักโดยละเอียด</span>
              </div>
            )}
          </div>

          {/* Right Column: Explanations Decision Log (col-span-1) */}
          <div className="glass-panel rounded-3xl p-6 bg-bg-surface border-border-main shadow-sm flex flex-col justify-between min-h-[380px]">
            <div className="flex flex-col gap-1 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="text-primary-500" size={18} />
                  <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
                    บันทึกการตัดสินใจหาเส้นทาง
                  </h3>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-xs text-text-sub font-semibold">คำอธิบายเหตุผลเบื้องหลังการตัดสินใจสลับเส้นทางสด</p>
            </div>

            {/* Logs Feed Container with Auto-Scroll */}
            <div 
              ref={logContainerRef}
              className="flex-1 overflow-y-auto max-h-[350px] pr-2 space-y-3.5 font-mono text-xs border-t border-border-main/50 pt-5"
            >
              {logs.map((log) => {
                let textClass = 'text-text-sub';
                let badgeColor = 'text-text-muted';

                if (log.type === 'success') {
                  textClass = 'text-emerald-600 dark:text-emerald-400 font-bold';
                  badgeColor = 'text-emerald-500';
                } else if (log.type === 'warning') {
                  textClass = 'text-amber-600 dark:text-amber-500 font-bold';
                  badgeColor = 'text-amber-500';
                } else if (log.type === 'danger') {
                  textClass = 'text-red-500 font-bold';
                  badgeColor = 'text-red-500';
                }

                return (
                  <div key={log.id} className="p-3 bg-bg-surface-elevated/40 border border-border-main/40 rounded-xl flex items-start gap-2.5 leading-relaxed animate-fade-in">
                    <span className={`font-bold select-none shrink-0 ${badgeColor}`}>[{log.time}]</span>
                    <span className={textClass}>{log.message}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-border-main/50 flex items-center gap-2 text-xs text-text-muted font-bold">
              <Info size={14} className="text-text-muted" />
              <span>โหนดจะสลับเส้นทางวิทยุโดยอัตโนมัติหากพบแบตเตอรี่ลดต่ำหรือสัญญาณวิทยุดรอป</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
