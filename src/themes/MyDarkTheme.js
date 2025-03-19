// 深色主題示例：可自行擴充更多參數，也可自訂 nodeContentRenderer 來改寫整個節點 UI。
const MyDarkTheme = {
  // 每一行的高度，預設 62px，可視需要調整
  rowHeight: 62,

  // 拖曳至視窗邊緣時，自動滾動距離
  slideRegionSize: 50,

  // 單層縮排的寬度
  scaffoldBlockPxWidth: 30,

  // 樹狀連接線的顏色改為白色
  scaffoldLineColor: '#FFFFFF',

  // 連接線背景色
  scaffoldBackground: '#FFFFFF',

  // 若要套用自訂樣式至最外層容器，可以使用以下屬性
  // style: { backgroundColor: '#333' },
  // containerStyle: { border: '1px solid #444' },

  // 可自訂整個節點顯示方式：若要完全取代 node content，使用 nodeContentRenderer
  // nodeContentRenderer: MyCustomNodeRenderer,

  // 是否為拖曳操作提供把手 (默認在左邊顯示把手 icon)
  // placeholderRenderer: MyCustomPlaceholderRenderer,
};

export default MyDarkTheme; 