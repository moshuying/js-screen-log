
export class ScreenLog {
  maxCurrentViewLogs = 10;
  dom: HTMLDivElement;
  hideTips = false;
  currentView = this.maxCurrentViewLogs
  reuseDom = new Array(this.maxCurrentViewLogs).fill(1).map(e => document.createElement('div'))
  scrollDom: HTMLDivElement;
  clearButton: HTMLButtonElement;
  constructor(options = {
    maxCurrentViewLogs: 10
  }) {
    this.maxCurrentViewLogs = options.maxCurrentViewLogs;
    const dom = document.createElement('div');
    this.dom = dom;
    dom.style.position = 'fixed';
    dom.style.top = '5px';
    dom.style.left = '5px';
    dom.style.borderRadius = '5px';
    dom.style.width = '300px';
    dom.style.fontSize = '12px';
    dom.style.paddingTop = '20px';
    dom.style.backgroundColor = 'rgba(0,0,0,0.02)';

    document.body.appendChild(dom);
    this.reuseDom.forEach(e => {
      dom.appendChild(e)
    })
    const scrollDom = document.createElement('div');
    this.scrollDom = scrollDom;
    scrollDom.style.position = 'absolute';
    scrollDom.style.top = '0px';
    scrollDom.style.left = parseInt(dom.style.left) + 'px';
    scrollDom.style.color = 'red';
    scrollDom.style.textAlign = 'center';
    scrollDom.style.transform = 'translateY(10%)';
    dom.appendChild(scrollDom);

    dom.addEventListener('wheel', (event) => {
      const delta = event.deltaY;
      if (delta > 0) {
        this.currentView = Math.min(this.logHistory.length - this.maxCurrentViewLogs, this.currentView + 1);
      } else {
        this.currentView = Math.max(0, this.currentView - 1);
      }
      const viewLogIndex = new Array(this.maxCurrentViewLogs).fill(1).map((e, i) => i + this.currentView)
      this.render(viewLogIndex)
    })

    // clear button
    const clearButton = document.createElement('button');
    this.clearButton = clearButton;
    clearButton.innerText = 'clear(alt + 1) / restore(alt + 2)';
    clearButton.style.position = 'absolute';
    clearButton.style.textAlign = 'center';
    clearButton.style.top = '2px';
    clearButton.style.border = 'none';
    clearButton.style.backgroundColor = 'transparent';
    dom.appendChild(clearButton);
    let flip = false;
    clearButton.addEventListener('click', () => {
      flip = !flip;
      if (flip) {
        this.clear()
      } else {
        this.restore()
      }
    })
    document.addEventListener('keydown', (event) => {
      // 组合键清空
      // alt + 1
      if (event.altKey && event.keyCode === 49) {
        this.clear()
      }
      // 组合键还原
      // alt + 2
      if (event.altKey && event.keyCode === 50) {
        this.restore()
      }
      // 彻底清空
      // alt + shift + 1
      if (event.altKey && event.shiftKey && event.keyCode === 49) {
        this.restoreLogArray.length = 0;
        this.logHistory.length = 0;
        this.render()
      }
    })

    const saveData = () => {
      this.log('ScreenLog closed', new Date().toISOString());
      this.restore()
      localStorage.setItem('logHistory', JSON.stringify(this.logHistory))
    }
    window.addEventListener('close', saveData)
    window.addEventListener('beforeunload', saveData)
    // restore
    const logHistory = localStorage.getItem('logHistory');
    if (logHistory) {
      this.logHistory = JSON.parse(logHistory);
      this.render()
    }

    this.log('ScreenLog created', new Date().toISOString());
  }
  logHistory: string[] = [];
  log(...args: string[]) {
    const message = args.join('\t');
    this.logHistory.push(message);
    this.render()
  }
  updateScrollTips() {
    if (this.hideTips) {
      this.scrollDom.style.display = 'none';
      this.clearButton.style.display = 'none';
      this.dom.style.paddingTop = '0px';
      return
    }
    this.scrollDom.innerText = (this.currentView + this.maxCurrentViewLogs) + ' / ' + this.logHistory.length
  }
  _visible = true;
  get visible() {
    return this._visible
  }
  set visible(value: boolean) {
    if (value) {
      this.dom.style.display = 'block';
    } else {
      this.dom.style.display = 'none';
    }
    this._visible = value;
  }
  render(viewLogIndex?: number[]) {
    if (!this.visible) {
      this.visible = false;
      return
    }
    if (viewLogIndex && viewLogIndex.length) {
      for (let i = 0; i < this.maxCurrentViewLogs; i++) {
        this.reuseDom[i].innerText = this.logHistory[viewLogIndex[i]] || ''
      }
    } else {
      this.currentView = this.logHistory.length - this.maxCurrentViewLogs;
      this.reuseDom.forEach((e, i) => {
        e.innerText = this.logHistory[this.logHistory.length - this.maxCurrentViewLogs + i] || ''
      })
    }
    this.updateScrollTips()
    this.clearButton.style.left = parseInt(this.dom.style.left) + this.scrollDom.clientWidth + 'px';
  }

  restoreLogArray: string[] = [];
  restore() {
    // clear
    this.logHistory.forEach(e => this.restoreLogArray.push(e));
    this.logHistory.length = 0;

    // restore
    this.restoreLogArray.forEach(e => this.logHistory.push(e));
    this.restoreLogArray.length = 0;

    this.log('restore', new Date().toISOString());
  }
  clear() {
    this.logHistory.forEach(e => this.restoreLogArray.push(e));
    this.logHistory.length = 0;

    this.log('clear', new Date().toISOString());
  }
}
export default ScreenLog;

/**
 * 检查数据波动，返回是否有波动和波动位置,使用了四分位数，数据量至少为8
 * @param data 
 * @param fluctuation 
 * @returns 
 */
export function checkDataFluctuation(data: number[]): number {
  function calculateStd(data: number[], numSections: number) {
    // 将数据分为numSections块，分布计算numSections块数据的标准差
    let dataLength = data.length;
    let sectionLength = Math.floor(dataLength / numSections);
    let sections = Array.from({ length: numSections }, (_, i) => data.slice(i * sectionLength, (i + 1) * sectionLength));

    // 0表示没有波动
    let stds = sections.map(section => {
      let avg = section.reduce((acc, cur) => acc + cur, 0) / section.length;
      return Math.sqrt(section.reduce((acc, cur) => acc + Math.pow(cur - avg, 2), 0) / section.length);
    });

    // 最大标准差
    let maxStd = Math.max(...stds);
    // 减去最大标准差的平均值
    let avgStd = (stds.reduce((acc, cur) => acc + cur, 0) - maxStd) / (numSections - 1);

    let epslion = 0.0000001;

    // 判断整体是否有波动
    if (Math.abs(maxStd - avgStd) > epslion){
      let fluctuation = stds.indexOf(maxStd);
      let startIndex = fluctuation * sectionLength;
      let endIndex = (fluctuation + 1) * sectionLength;
      // 波动区间数组
      let fluctuationData = data.slice(startIndex, endIndex);
      let fluctuationArr = fluctuationData.map((e, i) => fluctuationData[i + 1] - e).slice(0, fluctuationData.length - 1);
      let fluctuationMax = Math.max(...fluctuationArr);
      // 波动区间的变化值
      let fluctuationIndex = fluctuationArr.indexOf(fluctuationMax) + 1;
      return fluctuation * sectionLength + fluctuationIndex;
    }
    return -1
  }
  let fourSections = calculateStd(data, 4);
  if(fourSections !== -1) return fourSections;
  let threeSections = calculateStd(data, 6);
  return threeSections;
}