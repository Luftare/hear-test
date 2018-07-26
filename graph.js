class Graph {
  constructor({
    canvas,
    levels,
    levelIndB,
    frequencies,
    datas = [],
    legends = [],
  }) {
    this.lineColors = ['red', 'blue'];
    this.gridColor = '#aaa';
    this.lineWidth = 3;
    this.datas = datas;
    this.legends = legends;
    this.frequencies = frequencies;
    this.levels = levels;
    this.levelIndB = levelIndB;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.padding = 50;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    window.addEventListener('resize', () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      this.render();
    });
    this.drawGrid();
  }

  reset() {
    this.legends = [];
    this.datas = [];
    this.render();
  }

  drawGrid() {
    const { ctx, canvas, padding, frequencies, levels } = this;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const contentWidth = width - 2 * padding;
    const contentHeight = height - 2 * padding;
    const sampleOffsetX = contentWidth / (frequencies.length - 1);
    const levelOffsetY = contentHeight / (levels - 1);
    ctx.lineWidth = 1;
    frequencies.forEach((frq, i) => {
      const x = padding + sampleOffsetX * i;
      const y0 = padding;
      const y1 = padding + contentHeight;
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y1);
      ctx.strokeStyle = this.gridColor;
      ctx.stroke();
    });
    [...Array(this.levels)].forEach((_, i) => {
      const x0 = padding;
      const x1 = padding + contentWidth;
      const y = padding + i * levelOffsetY;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.strokeStyle = this.gridColor;
      ctx.stroke();
    });

    frequencies.forEach((frq, i) => {
      const x = padding + sampleOffsetX * i;
      const y = height - padding / 2;
      const text = `${Math.floor(frq)} Hz`;
      const textWidth = ctx.measureText(text).width;
      ctx.fillText(text, x - textWidth / 2, y);
    });

    [...Array(this.levels)].forEach((_, i) => {
      const x = padding / 2;
      const y = padding + i * levelOffsetY;
      const text = `${-Math.floor(i * this.levelIndB)} dB`;
      const textWidth = ctx.measureText(text).width;
      ctx.fillText(text, x - textWidth / 2, y + 4);
    });
  }

  drawLegend() {
    const { ctx, canvas, padding, frequencies, levels } = this;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const contentWidth = width - 2 * padding;
    const contentHeight = height - 2 * padding;

    const count = this.legends.length;
    const margin = 10;
    const dotMargin = 15;
    const dotSize = 8;
    const totalWidth = this.legends.reduce((acc, legend) => acc + ctx.measureText(legend).width + margin + dotMargin, -margin);
    let currentX = width / 2 - totalWidth / 2;
    this.legends.forEach((legend, i) => {
      const textWidth = ctx.measureText(legend).width;
      const x = currentX;
      const y = padding / 2;

      ctx.fillStyle = this.lineColors[i];
      ctx.fillRect(x, y - dotSize / 2, dotSize, dotSize);
      ctx.fillText(legend, x + dotMargin, y + 4);
      currentX += margin + dotMargin + textWidth;
    })
  }

  plot(data, name) {
    this.datas.push(data);
    this.legends.push(name);
    this.render();
  }

  clearCanvas() {
    this.canvas.width = this.canvas.width;
  }

  render() {
    const { ctx, canvas, padding, frequencies, datas } = this;
    const width = canvas.width;
    const height = canvas.offsetHeight;
    const contentWidth = width - 2 * padding;
    const contentHeight = height - 2 * padding;
    const sampleOffsetX = contentWidth / (frequencies.length - 1);
    this.clearCanvas();
    this.drawGrid();
    this.drawLegend();
    ctx.lineWidth = this.lineWidth;
    datas.forEach((data, dataIndex) => {
      ctx.beginPath();
      data.forEach((sample, i) => {
        const x = padding + i * sampleOffsetX;
        const y = padding + (sample / (this.levels - 1)) * contentHeight;
        if(i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.strokeStyle = this.lineColors[dataIndex];
      ctx.stroke();
    });
  }
}
