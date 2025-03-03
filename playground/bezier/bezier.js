class BezierEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.controlPoints = [];
        this.animationFrame = null;
        this.animationProgress = 0;
        this.isAnimating = false;
        this.dragState = null;
        this.scale = 1.0;
        this.offset = { x: 0, y: 0 };
        this.isPaused = false;
        this.steps = 1000;

        this.setupEventListeners();
    }

    resetScale() {
        this.scale = 1.0;
        this.offset = { x: 0, y: 0 };
        
        // Force canvas resize and redraw
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        this.drawCurve();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', () => this.dragState = false);
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    deCasteljau(points, t) {
        if (points.length === 1) return points[0];
        const newPoints = [];
        for (let i = 0; i < points.length - 1; i++) {
            // Get weights from points
            const w1 = points[i].weight || 1.0;
            const w2 = points[i + 1].weight || 1.0;
            
            // Calculate weighted combination
            const combinedWeight = (1 - t) * w1 + t * w2;
            const x = ((1 - t) * w1 * points[i].x + t * w2 * points[i + 1].x) / combinedWeight;
            const y = ((1 - t) * w1 * points[i].y + t * w2 * points[i + 1].y) / combinedWeight;
            
            newPoints.push({
                x: x,
                y: y,
                weight: combinedWeight
            });
        }
        return this.deCasteljau(newPoints, t);
    }

    drawConstructionLines(points, t) {
        if (!document.getElementById('showConstruction').checked) return;
        
        let currentPoints = [...points];
        const levels = [];
        
        while (currentPoints.length > 1) {
            levels.push(currentPoints);
            const nextPoints = [];
            for (let i = 0; i < currentPoints.length - 1; i++) {
                const w1 = currentPoints[i].weight || 1.0;
                const w2 = currentPoints[i + 1].weight || 1.0;
                
                const combinedWeight = (1 - t) * w1 + t * w2;
                const x = ((1 - t) * w1 * currentPoints[i].x + t * w2 * currentPoints[i + 1].x) / combinedWeight;
                const y = ((1 - t) * w1 * currentPoints[i].y + t * w2 * currentPoints[i + 1].y) / combinedWeight;
                
                nextPoints.push({
                    x: x,
                    y: y,
                    weight: combinedWeight
                });
            }
            currentPoints = nextPoints;
        }
        
        // Draw construction lines with decreasing opacity
        levels.forEach((level, index) => {
            const opacity = 1 - (index / levels.length) * 0.7;
            this.ctx.strokeStyle = `rgba(200, 200, 200, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.moveTo(level[0].x, level[0].y);
            for (let i = 1; i < level.length; i++) {
                this.ctx.lineTo(level[i].x, level[i].y);
            }
            this.ctx.stroke();
            
            // Draw intermediate points
            level.forEach(point => {
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(150, 150, 150, ${opacity})`;
                this.ctx.fill();
            });
        });
    }

    drawCurve() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.offset.x, this.offset.y);
        this.ctx.scale(this.scale, this.scale);

        // Draw points and control polygon
        if (this.controlPoints.length > 0) {
            // Draw control points
            this.controlPoints.forEach((p, i) => {
                this.ctx.beginPath(); 
                this.ctx.fillStyle = '#ff2200';
                this.ctx.arc(p.x, p.y, 10 / this.scale, 0, Math.PI * 2);
                this.ctx.fill();

                // Weight circle
                this.ctx.beginPath();
                this.ctx.strokeStyle = '#0044ff';
                if (p.weight > 0) {
                    this.ctx.arc(p.x, p.y, p.weight * 48 / this.scale, 0, Math.PI * 2);
                }
                else {
                    this.ctx.arc(p.x, p.y, 0, 0, Math.PI * 2);
                }
                this.ctx.stroke();

                // Show weight value on the right side
                const weightText = p.weight >= 10 ? 
                    p.weight.toFixed(0): 
                    p.weight.toFixed(1);
                this.drawCoordinateLabel(p.x + p.weight * 48 / this.scale, p.y,
                    weightText, {x: 5, y: 0});

                // Draw point coordinates
                const coordX = ((p.x - 200) / 100).toFixed(2);
                const coordY = ((p.y - 200) / 100).toFixed(2);
                this.drawCoordinateLabel(p.x, p.y,
                    `P${i}(${coordX},${coordY})`, {x: 0, y: -20});
            });
        }
        if (this.controlPoints.length >= 2) {
            // Draw control polygon
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#888';
            this.ctx.setLineDash([5, 5]);
            this.controlPoints.forEach((point, i) => {
                if (i === 0) this.ctx.moveTo(point.x, point.y);
                else this.ctx.lineTo(point.x, point.y);
            });
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }


        if (this.isAnimating) {
            // Draw construction lines for current animation progress
            this.drawConstructionLines(this.controlPoints, this.animationProgress);
            
            // Draw curve up to current progress with more steps
            this.ctx.beginPath();
            this.ctx.moveTo(this.controlPoints[0].x, this.controlPoints[0].y);
            const stepSize = this.animationProgress / this.steps;
            for (let i = 0; i <= this.steps; i++) {
                const t = i * stepSize;
                const point = this.deCasteljau(this.controlPoints, t);
                this.ctx.lineTo(point.x, point.y);
            }
            this.ctx.strokeStyle = 'green';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.lineWidth = 1;
        } else {
            // Draw complete curve with more steps
            if (this.controlPoints.length) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.controlPoints[0].x, this.controlPoints[0].y);
                const stepSize = 1 / this.steps;
                for (let i = 0; i <= this.steps; i++) {
                    const t = i * stepSize;
                    const point = this.deCasteljau(this.controlPoints, t);
                    this.ctx.lineTo(point.x, point.y);
                }
                this.ctx.strokeStyle = 'green';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.lineWidth = 1;
            }
        }
        this.ctx.restore();
    }


    drawCoordinateLabel(x, y, text, offset = {x: 10, y: -10}) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.font = `${10/this.scale}px Arial`;
        this.ctx.fillText(text, x + offset.x, y + offset.y);
        this.ctx.restore();
    }

    handleMouseDown(e) {
        e.preventDefault(); 
        
        const rect = this.canvas.getBoundingClientRect(); 
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        // Scale mouse coordinates by canvas size ratio
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const pos = this.inverseTransformPoint(mouseX * scaleX, mouseY * scaleY);

        // Right click to delete points
        if (e.button === 2) {
            const pointIndex = this.findNearestPoint(pos.x, pos.y);
            if (pointIndex !== -1) {
                this.controlPoints.splice(pointIndex, 1);
                this.updatePointsList();
                this.drawCurve();
            }
            return;
        }

        // Check if clicking near existing point
        let pointIndex = -1;
        let weightIndex = -1;

        for (let i = 0; i < this.controlPoints.length; i++) {
            const p = this.controlPoints[i];
            const dist = Math.hypot(pos.x - p.x, pos.y - p.y);
            if (dist <=  10 / this.scale) {
                pointIndex = i;
                break;
            } else if (dist < p.weight  * 48 / this.scale && dist > 10 / this.scale) {
                weightIndex = i;
                break;
            }
        }

        if (e.button === 2) { // Right click to delete
            e.preventDefault();
            if (pointIndex >= 0 || weightIndex >= 0) {
                const indexToRemove = pointIndex >= 0 ? pointIndex : weightIndex;
                this.controlPoints.splice(indexToRemove, 1);
                this.drawCurve();
                this.updatePointsList();
            }
            return;
        }

        // Handle left click for dragging
        if (pointIndex >= 0) {
            this.dragState = { type: 'point', index: pointIndex };
        } else if (weightIndex >= 0) {
            this.dragState = { type: 'weight', index: weightIndex };
        } else {
            this.controlPoints.push({ x:pos.x, y:pos.y, weight: 1.0 });
            this.updatePointsList; // Make sure point shows in input box immediately
            this.drawCurve();

        }
    }

    handleMouseMove(e) {


        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const pos = this.inverseTransformPoint(
            (e.clientX - rect.left) * scaleX,
            (e.clientY - rect.top) * scaleY
        );
        if (!this.dragState) return;

        if (this.dragState.type === 'point') {
            this.controlPoints[this.dragState.index].x = pos.x;
            this.controlPoints[this.dragState.index].y = pos.y;
        } else if (this.dragState.type === 'weight') {
            const point = this.controlPoints[this.dragState.index];
            const distance = Math.hypot(pos.x - point.x, pos.y - point.y);
            point.weight = Math.max(0.1, distance / 30);
        }
        this.drawCurve();
        this.updatePointsList();
    }

    handleWheel(e) {
        // Add check for points
        if (this.controlPoints.length === 0) return;

        e.preventDefault();
        const mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - this.canvas.getBoundingClientRect().top;

        const startX = (mouseX - this.offset.x) / this.scale;
        const startY = (mouseY - this.offset.y) / this.scale;

        this.scale *= e.deltaY > 0 ? 0.9 : 1.1;
        this.scale = Math.min(Math.max(0.1, this.scale), 10.0);

        this.offset.x = mouseX - startX * this.scale;
        this.offset.y = mouseY - startY * this.scale;

        this.drawCurve();
    }

    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.isPaused = false;
        this.animationProgress = 0;
        this.animate();
    }

    pauseAnimation() {
        if (this.isAnimating && !this.isPaused) {
            this.isPaused = true;
            cancelAnimationFrame(this.animationFrame);
        }
    }

    resumeAnimation() {
        if (this.isAnimating && this.isPaused) {
            this.isPaused = false; 
            this.animate();
        }
    }

    animate() {
        if (this.isPaused) return;

        const speed = document.getElementById('animationSpeed').value / 1000;
        this.animationProgress += speed;
        
        if (this.animationProgress <= 1) {
            this.drawCurve();
            this.animationFrame = requestAnimationFrame(this.animate.bind(this));
        } else {
            this.isAnimating = false;
            this.isPaused = false;
            this.animationProgress = 1;
            this.drawCurve();
        }
    }

    addPointFromInput() {
        const x = parseFloat(document.getElementById('pointX').value) * 100 + 200;
        const y = parseFloat(document.getElementById('pointY').value) * 100 + 200;
        
        if (!isNaN(x) && !isNaN(y)) {
            this.controlPoints.push({x, y});
            document.getElementById('pointX').value = '';
            document.getElementById('pointY').value = '';
            this.drawCurve();
            this.updatePointsList();
        }
    }

    updatePointsList() {
        // Update the textarea instead of the old points list
        const pointsText = this.controlPoints.map(p => {
            const x = ((p.x - 200) / 100).toFixed(2);
            const y = ((p.y - 200) / 100).toFixed(2);
            return `${x},${y},${p.weight}`;
        }).join('\n');
        document.getElementById('pointsInput').value = pointsText;
    }

    clearPoints() {
        this.controlPoints = [];
        this.drawCurve();
        this.updatePointsList();
    }

    transformPoint(x, y) {
        return {
            x: x * this.scale + this.offset.x,
            y: y * this.scale + this.offset.y
        };
    }

    inverseTransformPoint(x, y) {
        return {
            x: (x - this.offset.x) / this.scale,
            y: (y - this.offset.y) / this.scale
        };
    }

    findNearestPoint(x, y) {
        const threshold = 10 / this.scale; // Adjust threshold based on zoom level
        return this.controlPoints.findIndex(p => 
            Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) < threshold
        );
    }

    updatePoints() {
        const text = document.getElementById('pointsInput').value;
        this.controlPoints = text.split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(line => {
                const [x, y, w] = line.split(',').map(Number);
                return { 
                    x: x * 100 + 200, 
                    y: y * 100 + 200,
                    weight: w || 1.0 
                };
            });
        this.drawCurve();
        this.updatePointsList();
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    window.bezierEditor = new BezierEditor();
});