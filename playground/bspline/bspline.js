class BSplineEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.controlPoints = [];
        this.knots = [];
        this.degree = 3;
        this.dragState = null;
        this.scale = 1.0;
        this.offset = { x: 0, y: 0 };
        this.lastMousePos = null;
        this.clampStart = document.getElementById('clampStart').checked;
        this.clampEnd = document.getElementById('clampEnd').checked;
        this.steps = 1000;
        this.isAnimating = false;
        this.isPaused = false;
        this.animationProgress = 0;
        this.animationFrame = null;

        this.setupZoomPan();

        // Set up canvas event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', () => this.dragState = null);
        this.canvas.addEventListener('mouseleave', () => this.dragState = null);
    }
 
    resetScale() {
        this.scale = 1.0;
        this.offset = { x: 0, y: 0 };
        this.drawCurve();
    }

    setupEventListeners() {
        // Button events
        document.getElementById('clearPoints').addEventListener('click', () => this.clearPoints());
        document.getElementById('degreeInput').addEventListener('change', (e) => {
            this.degree = parseInt(e.target.value);
            this.updateKnots();
            this.drawCurve();
        });

        // Add clamp controls
        document.getElementById('clampStart').addEventListener('change', (e) => {
            this.clampStart = e.target.checked;
            this.updateKnots();
            this.drawCurve();
        });

        document.getElementById('clampEnd').addEventListener('change', (e) => {
            this.clampEnd = e.target.checked;
            this.updateKnots();
            this.drawCurve();
        });

        // Animation control buttons
        document.getElementById('animationStart').addEventListener('click', () => this.startAnimation());
        document.getElementById('animationPause').addEventListener('click', () => this.pauseAnimation());
        document.getElementById('animationResume').addEventListener('click', () => this.resumeAnimation());
        document.getElementById('animationClear').addEventListener('click', () => this.clearAll());
    }

    setupInputHandlers() {
        document.getElementById('applyPoints').addEventListener('click', () => {
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
            
            this.updateKnots();
            this.drawCurve();
        });

        document.getElementById('applyKnots').addEventListener('click', () => {
            const text = document.getElementById('knotsInput').value;
            this.knots = text.split(',')
                .map(k => k.trim())
                .filter(k => k)
                .map(Number);
            this.drawCurve();
        });
    }

    setupZoomPan() {
        this.canvas.addEventListener('wheel', (e) => {
            // Add check for points
            if (this.controlPoints.length === 0) return;

            e.preventDefault();
            const mouseX = e.clientX - this.canvas.getBoundingClientRect().left;
            const mouseY = e.clientY - this.canvas.getBoundingClientRect().top;

            // Convert mouse position to canvas coordinates before zoom
            const startX = (mouseX - this.offset.x) / this.scale;
            const startY = (mouseY - this.offset.y) / this.scale;

            // Adjust scale
            this.scale *= e.deltaY > 0 ? 0.9 : 1.1;
            this.scale = Math.min(Math.max(0.1, this.scale), 10.0);

            // Adjust offset to zoom toward mouse position
            this.offset.x = mouseX - startX * this.scale;
            this.offset.y = mouseY - startY * this.scale;

            this.drawCurve();
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1) { // Middle mouse button
                e.preventDefault();
                this.lastMousePos = { x: e.clientX, y: e.clientY };
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.lastMousePos) {
                this.offset.x += e.clientX - this.lastMousePos.x;
                this.offset.y += e.clientY - this.lastMousePos.y;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.drawCurve();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.lastMousePos = null;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.lastMousePos = null;
        });
    }

    updateKnots() {
        const n = this.controlPoints.length - 1;  // n is number of control points minus 1
        const p = this.degree;
        
        // Generate uniform knots first
        let knots = [];
        
        if (this.clampStart && this.clampEnd) {
            // For clamped B-spline at both ends
            knots = [...Array(p + 1).fill(0)];  // First p+1 knots are 0
            
            // Middle knots - need n-p of them
            for (let i = 1; i < n - p + 1; i++) {
                knots.push(i / (n - p + 1));
            }
            
            knots.push(...Array(p + 1).fill(1));  // Last p+1 knots are 1
        }
        else if (this.clampStart) {
            // Clamp at start only
            knots = [...Array(p + 1).fill(0)];
            
            // Distribute remaining knots uniformly
            for (let i = 1; i <= n + 1; i++) {
                knots.push(i / (n + 1));
            }
        }
        else if (this.clampEnd) {
            // Clamp at end only 
            for (let i = 0; i < n + 1; i++) {
                knots.push(i / (n + 1));
            }
            knots.push(...Array(p + 1).fill(1));
        }
        else {
            // No clamping - uniform knot vector
            const m = n + p + 1;  // Total number of knots needed - 1
            for (let i = 0; i <= m; i++) {
                knots.push(i / m);
            }
        }

        this.knots = knots;
        document.getElementById('knotsInput').value = 
            this.knots.map(k => k.toFixed(3)).join(',');
    }

    addControlPoint(x, y) {
        this.controlPoints.push({ x, y, weight: 1.0 });
        this.updateKnots();
        this.updateInputBoxes(); // Make sure point shows in input box immediately
        this.drawCurve();
    }

    clearPoints() {
        this.controlPoints = [];
        this.knots = [];
        this.drawCurve();
    }

    clearAll() {
        this.controlPoints = [];
        this.knots = [];
        this.animationProgress = 0;
        this.isAnimating = false;
        this.isPaused = false;
        this.dragState = null;
        this.lastMousePos = null;
        this.updateInputBoxes();
        this.drawCurve();
    }

    handleMouseDown(e) {
        if (e.button === 1) { // If middle mouse button, handle panning
            e.preventDefault();
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            return;
        }
        e.preventDefault();

        const rect = this.canvas.getBoundingClientRect(); 
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        // Scale mouse coordinates by canvas size ratio
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const pos = this.inverseTransformPoint(mouseX * scaleX, mouseY * scaleY);

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
                this.updateKnots();
                this.drawCurve();
                this.updateInputBoxes();
            }
            return;
        }

        // Handle left click for dragging
        if (pointIndex >= 0) {
            this.dragState = { type: 'point', index: pointIndex };
        } else if (weightIndex >= 0) {
            this.dragState = { type: 'weight', index: weightIndex };
        } else {
            this.addControlPoint(pos.x, pos.y);
        }
        this.updateInputBoxes();
    }

    handleMouseMove(e) {
        if (this.lastMousePos) { // Handle panning
            this.offset.x += e.clientX - this.lastMousePos.x;
            this.offset.y += e.clientY - this.lastMousePos.y;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            this.drawCurve();
            return;
        }

        const rect = this.canvas.getBoundingClientRect(); 
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        // Scale mouse coordinates by canvas size ratio
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const pos = this.inverseTransformPoint(mouseX * scaleX, mouseY * scaleY);

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
        this.updateInputBoxes();
    }

    deBoor(t) {
        if (this.knots.length === 0) return null;
        
        const k = this.degree;
        const n = this.controlPoints.length - 1; 
        if (n < k) return null;

        // Find knot span
        let span;
        for (span = k; span < n; span++) {
            if (t <= this.knots[span + 1]) {
                break;
            }
        }

        // Skip if t is outside valid range 
        if (t < this.knots[k] || t > this.knots[n + 1]) {
            return null;
        }

        // Initialize d[] array with affected control points
        const d = Array(k + 1);
        for (let i = 0; i <= k; i++) {
            d[i] = {
                x: this.controlPoints[span - k + i].x,
                y: this.controlPoints[span - k + i].y
            };
        }
        
        // Apply de Boor recursion
        for (let r = 1; r <= k; r++) {
            for (let j = k; j >= r; j--) {
                const alpha = (t - this.knots[span - k + j]) /
                            (this.knots[span + j - r + 1] - this.knots[span - k + j]);
                
                d[j] = {
                    x: (1 - alpha) * d[j - 1].x + alpha * d[j].x,
                    y: (1 - alpha) * d[j - 1].y + alpha * d[j].y
                };
            }
        }

        return d[k];
    }

    calculateBasisFunctions(u, i, k, knots) {
        if (k === 0) {
            return (u >= knots[i] && u < knots[i + 1]) ? 1.0 : 0.0;
        }

        let basis = 0.0;
        
        let d1 = knots[i + k] - knots[i];
        if (d1 > 0) {
            basis += ((u - knots[i]) / d1) * this.calculateBasisFunctions(u, i, k - 1, knots);
        }

        let d2 = knots[i + k + 1] - knots[i + 1];
        if (d2 > 0) {
            basis += ((knots[i + k + 1] - u) / d2) * this.calculateBasisFunctions(u, i + 1, k - 1, knots);
        }

        return basis;
    }

    evaluateBSpline(u) {
        if (this.controlPoints.length <= this.degree) return null;

        // For clamped splines, explicitly handle endpoints for any knot value at endpoints
        const isClamped = this.clampStart || this.clampEnd;
        if (isClamped) {
            if (this.clampStart && Math.abs(u - this.knots[0]) < Number.EPSILON) {
                // Return first control point for knots at the start 
                return {x: this.controlPoints[0].x, y: this.controlPoints[0].y};
            }
            if (this.clampEnd && Math.abs(u - this.knots[this.knots.length - 1]) < Number.EPSILON) {
                // Return last control point for knots at the end
                const lastPoint = this.controlPoints[this.controlPoints.length - 1];
                return {x: lastPoint.x, y: lastPoint.y};
            }
        }

        // Find span containing u 
        let span;
        for (span = this.degree; span < this.controlPoints.length - 1; span++) {
            if (u <= this.knots[span + 1]) {
                break;
            }
        }

        // Skip if outside valid range
        if (u < this.knots[this.degree] || u > this.knots[this.controlPoints.length]) {
            return null;
        }

        // Initialize arrays for points and weights in current segment
        const points = Array(this.degree + 1);
        const weights = Array(this.degree + 1);
        const basis = Array(this.degree + 1);

        // Get control points and weights affecting this segment
        for (let i = 0; i <= this.degree; i++) {
            const point = this.controlPoints[span - this.degree + i];
            points[i] = {x: point.x, y: point.y};
            weights[i] = point.weight;
            basis[i] = this.calculateBasisFunctions(u, span - this.degree + i, this.degree, this.knots);
        }

        // Calculate weighted basis functions for this segment only
        const weightedBasis = basis.map((b, i) => b * weights[i]); 
        const denominator = weightedBasis.reduce((a, b) => a + b, 0);

        // Calculate final point using weighted average
        let x = 0, y = 0;
        for (let i = 0; i <= this.degree; i++) {
            const factor = weightedBasis[i] / denominator;
            x += factor * points[i].x;
            y += factor * points[i].y;
        }

        return {x, y};
    }

    updateInputBoxes() {
        const pointsText = this.controlPoints.map(p => {
            const x = ((p.x - 200) / 100).toFixed(2);
            const y = ((p.y - 200) / 100).toFixed(2);
            const w = p.weight.toFixed(2);
            return `${x},${y},${w}`;
        }).join('\n');
        document.getElementById('pointsInput').value = pointsText;

        if (this.knots.length > 0) {
            document.getElementById('knotsInput').value = this.knots.map(k => k.toFixed(3)).join(',');
        }
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

    drawCoordinateLabel(x, y, text, offset = {x: 10, y: -10}) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.font = `${10/this.scale}px Arial`;
        this.ctx.fillText(text, x + offset.x, y + offset.y);
        this.ctx.restore();
    }

    // Add animation controls
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
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
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
            this.animationFrame = requestAnimationFrame(() => this.animate());
        } else {
            this.isAnimating = false;
            this.isPaused = false;
            this.animationProgress = 1;
            this.drawCurve();
        }
    }

    resetAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.isAnimating = false;
        this.animationProgress = 0;
        this.drawCurve();
    }

    // Add method to draw construction lines
    drawConstructionLines(t) {
        if (!document.getElementById('showConstruction').checked) return;

        const k = this.degree;
        const n = this.controlPoints.length - 1;
        let span;
        for (span = k; span < n; span++) {
            if (t <= this.knots[span + 1]) break;
        }

        // Skip if outside valid range
        if (t < this.knots[k] || t > this.knots[n + 1]) {
            return;
        }

        // Get all intermediate points using de Boor recursion
        const points = [];
        let current = [];

        // Initialize with affected control points
        for (let i = 0; i <= k; i++) {
            current.push({
                x: this.controlPoints[span - k + i].x,
                y: this.controlPoints[span - k + i].y
            });
        }
        points.push([...current]);

        // Apply de Boor recursion and store intermediate points
        for (let r = 1; r <= k; r++) {
            const next = [];
            for (let i = 0; i < k - r + 1; i++) {
                const alpha = (t - this.knots[span - k + r + i]) /
                             (this.knots[span + i + 1] - this.knots[span - k + r + i]);
                next.push({
                    x: (1 - alpha) * current[i].x + alpha * current[i + 1].x,
                    y: (1 - alpha) * current[i].y + alpha * current[i + 1].y
                });
            }
            points.push([...next]);
            current = next;
        }

        // Draw construction lines with decreasing opacity
        points.forEach((level, index) => {
            const opacity = 1 - (index / points.length) * 0.7;
            
            // Draw lines connecting points
            this.ctx.beginPath();
            // Change initial level (control polygon) to black
            this.ctx.strokeStyle = index === 0 ? 
                'rgba(0, 0, 0, 1)' :  // Black for control polygon
                `rgba(200, 200, 200, ${opacity})`; // Gray for construction
            
            if (level.length > 0) {
                this.ctx.moveTo(level[0].x, level[0].y);
                
                for (let i = 1; i < level.length; i++) {
                    this.ctx.lineTo(level[i].x, level[i].y);
                }
            }
            this.ctx.stroke();

            // Draw intermediate points
            level.forEach(point => {
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 3/this.scale, 0, Math.PI * 2);
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
        
        // Draw points even if less than 2 points
        this.controlPoints.forEach((point, i) => {
            // Draw control points
            this.ctx.beginPath();
            this.ctx.fillStyle = '#ff2200';
            this.ctx.arc(point.x, point.y, 10 / this.scale, 0, Math.PI * 2);
            this.ctx.fill();

            // Weight circle
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#0044ff';
            if (point.weight > 0) {
                this.ctx.arc(point.x, point.y, point.weight * 48 / this.scale, 0, Math.PI * 2);
            }
            else {
                this.ctx.arc(point.x, point.y, 0, 0, Math.PI * 2);
            }
            this.ctx.stroke();

            // Show weight value on the right side
            const weightText = point.weight >= 10 ? 
                point.weight.toFixed(0) : 
                point.weight.toFixed(1);
            this.drawCoordinateLabel(point.x + point.weight * 48 / this.scale, point.y,
                weightText, {x: 5, y: 0});

            // Draw control point label above point
            const coordX = ((point.x - 200) / 100).toFixed(2);
            const coordY = ((point.y - 200) / 100).toFixed(2); 
            this.drawCoordinateLabel(point.x, point.y,
                `P${i}(${coordX},${coordY})`, {x: 0, y: -20});
        });

        // Only draw control polygon if at least 2 points
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

        // Draw B-spline curve if we have enough control points (degree + 1 or more)
        if (this.controlPoints.length >= this.degree + 1) {
            // Draw the main curve
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'blue';
            this.ctx.lineWidth = 2;
            
            let firstPoint = true;
            for (let i = 0; i <= this.steps; i++) {
                const u = this.knots[0] + (i / this.steps) * (this.knots[this.knots.length - 1] - this.knots[0]);
                const point = this.evaluateBSpline(u);
                
                if (point) {
                    if (firstPoint) {
                        this.ctx.moveTo(point.x, point.y);
                        firstPoint = false;
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                }
            }
            this.ctx.stroke();

            // Draw construction lines and animation point if animating
            if (this.isAnimating) {
                const u = this.animationProgress;
                this.drawConstructionLines(u);
                const point = this.evaluateBSpline(u);
                if (point) {
                    this.ctx.beginPath();
                    this.ctx.fillStyle = 'red';
                    this.ctx.arc(point.x, point.y, 8 / this.scale, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }

            // Draw knot points
            this.knots.forEach((t, i) => {
                // Skip interior repeated knots at clamped ends, but keep first/last knot
                if ((this.clampStart && i > 0 && i < this.degree) || 
                    (this.clampEnd && i < this.knots.length - 1 && i > this.knots.length - this.degree - 2)) {
                    return;
                }

                const point = this.evaluateBSpline(t);
                if (point) {
                    this.ctx.beginPath();
                    this.ctx.fillStyle = 'green';
                    this.ctx.arc(point.x, point.y, 4 / this.scale, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Show computed point coordinates
                    const x = ((point.x - 200) / 100).toFixed(2);
                    const y = ((point.y - 200) / 100).toFixed(2);
                    this.drawCoordinateLabel(point.x, point.y, 
                        `t${i}(${x},${y})`, {x: 10, y: 15});
                }
            });
        }

        this.ctx.restore();
    }

    updateFromCheckboxes() {
        this.clampStart = document.getElementById('clampStart').checked;
        this.clampEnd = document.getElementById('clampEnd').checked;
        this.updateKnots();
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
        
        this.updateKnots();
        this.drawCurve();
    }
}
