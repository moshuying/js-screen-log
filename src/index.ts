
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

  if(data.length < 8){
    console.warn('数据量至少为8')
    return -1
  }

  // 将数据分为四块，分布计算四块数据的标准差
  let dataLength = data.length
  let data1 = data.slice(0, Math.floor(dataLength / 4))
  let data2 = data.slice(Math.floor(dataLength / 4), Math.floor(dataLength / 2))
  let data3 = data.slice(Math.floor(dataLength / 2), Math.floor(dataLength * 3 / 4))
  let data4 = data.slice(Math.floor(dataLength * 3 / 4), dataLength)

  let std1 = Math.sqrt(data1.reduce((acc, cur) => acc + Math.pow(cur - data1.reduce((acc, cur) => acc + cur, 0) / data1.length, 2), 0) / data1.length)
  let std2 = Math.sqrt(data2.reduce((acc, cur) => acc + Math.pow(cur - data2.reduce((acc, cur) => acc + cur, 0) / data2.length, 2), 0) / data2.length)
  let std3 = Math.sqrt(data3.reduce((acc, cur) => acc + Math.pow(cur - data3.reduce((acc, cur) => acc + cur, 0) / data3.length, 2), 0) / data3.length)
  let std4 = Math.sqrt(data4.reduce((acc, cur) => acc + Math.pow(cur - data4.reduce((acc, cur) => acc + cur, 0) / data4.length, 2), 0) / data4.length)


  // 找到波动最大的那一块，比较是否超过其他三块的标准差的两倍
  let stdArray = [std1, std2, std3, std4]
  let maxStd = Math.max(...stdArray)
  let maxStdIndex = stdArray.indexOf(maxStd)
  let stdArrayWithoutMax = stdArray.filter((e, i) => i !== maxStdIndex)
  let isFluctuation = stdArrayWithoutMax.every(e => maxStd > e * 2)
  return isFluctuation ? maxStdIndex * dataLength / 4 : -1
}