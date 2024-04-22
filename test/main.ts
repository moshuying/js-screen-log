import { ScreenLog } from "../src/index";
const screenLog = new ScreenLog({
  maxCurrentViewLogs: 10
});

screenLog.restoreLogArray.length = 0;
screenLog.logHistory.length = 0;
screenLog.render()
const data = new Array(100).fill(0).map((_, i) => i + Math.random() * 10);
data[50] = 0.1;
data.forEach(e => {
  screenLog.log(e.toString())
});