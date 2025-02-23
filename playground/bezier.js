class BezierEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.controlPoints = [];
        this.animationFrame = null;
        this.animationProgress = 0;
        this.isAnimating = false;
        this.isDragging = false;
        this.dragIndex = -1;
        this.scale = 1.0;
        this.offset = { x: 0, y: 0 };
        this.isPaused = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', () => this.isDragging = false);
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    deCasteljau(points, t) {
        if (points.length === 1) return points[0];
        const newPoints = [];
        for (let i = 0; i < points.length - 1; i++) {
            newPoints.push({
                x: (1 - t) * points[i].x + t * points[i + 1].x,
                y: (1 - t) * points[i].y + t * points[i + 1].y
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
                const p1 = currentPoints[i];
                const p2 = currentPoints[i + 1];
                nextPoints.push({
                    x: (1 - t) * p1.x + t * p2.x,
                    y: (1 - t) * p1.y + t * p2.y 
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
            // Draw control polygon
            this.ctx.beginPath();
            this.ctx.moveTo(this.controlPoints[0].x, this.controlPoints[0].y);
            for (let i = 1; i < this.controlPoints.length; i++) {
                this.ctx.lineTo(this.controlPoints[i].x, this.controlPoints[i].y);
            }
            this.ctx.strokeStyle = '#999';
            this.ctx.setLineDash([5, 5]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Draw control points
            this.controlPoints.forEach((p, i) => {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 5/this.scale, 0, Math.PI * 2);
                this.ctx.fillStyle = 'blue';
                this.ctx.fill();
                this.ctx.stroke();

                // Draw point coordinates
                const coordX = ((p.x - 200) / 100).toFixed(2);
                const coordY = ((p.y - 200) / 100).toFixed(2);
                this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
                this.ctx.font = `${12/this.scale}px Arial`;
                this.ctx.fillText(`P${i}(${coordX},${coordY})`, p.x + 10/this.scale, p.y - 10/this.scale);
            });
        }

        if (this.controlPoints.length < 2) return;
        
        if (this.isAnimating) {
            // Draw construction lines for current animation progress
            this.drawConstructionLines(this.controlPoints, this.animationProgress);
            
            // Draw curve up to current progress
            this.ctx.beginPath();
            this.ctx.moveTo(this.controlPoints[0].x, this.controlPoints[0].y);
            for (let t = 0; t <= this.animationProgress; t += 0.01) {
                const point = this.deCasteljau(this.controlPoints, t);
                this.ctx.lineTo(point.x, point.y);
            }
            this.ctx.strokeStyle = 'green';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.lineWidth = 1;
        } else {
            // Draw complete curve
            this.ctx.beginPath();
            this.ctx.moveTo(this.controlPoints[0].x, this.controlPoints[0].y);
            for (let t = 0; t <= 1; t += 0.01) {
                const point = this.deCasteljau(this.controlPoints, t);
                this.ctx.lineTo(point.x, point.y);
            }
            this.ctx.strokeStyle = 'green';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.lineWidth = 1;
        }
        this.ctx.restore();
    }

    handleMouseDown(e) {
        e.preventDefault(); 
        
        const rect = this.canvas.getBoundingClientRect(); 
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const pos = this.inverseTransformPoint(mouseX, mouseY);

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

        // Left click to add/drag points
        const pointIndex = this.findNearestPoint(pos.x, pos.y);
        if (pointIndex !== -1) {
            this.isDragging = true;
            this.dragIndex = pointIndex;
        } else {
            this.controlPoints.push({x: pos.x, y: pos.y});
            this.updatePointsList();
            this.drawCurve(); 
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;

        const rect = this.canvas.getBoundingClientRect();
        const pos = this.inverseTransformPoint(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
        this.controlPoints[this.dragIndex] = pos;
        this.updatePointsList();
        this.drawCurve();
    }

    handleWheel(e) {
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
            return `${x},${y}`;
        }).join('\n');
        document.getElementById('pointsInput').value = pointsText;
    }

    clearPoints() {
        this.controlPoints = [];
        this.resetAnimation();
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
                const [x, y] = line.split(',').map(Number);
                return { 
                    x: x * 100 + 200, 
                    y: y * 100 + 200
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