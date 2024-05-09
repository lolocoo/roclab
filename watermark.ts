interface Props {
  content?: string;
  tip?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  verify?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  alpha?: number;
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  rotate?: number;
  zIndex?: number;
  backgroundPosition?: string;
  onSuccess?: () => void;
  onWatermarkNull?: () => void;
  onDestory?: () => void;
}

class Watermark {
  content?: string;
  tip?: string;
  contentImage?: string;
  imageWidth?: number;
  imageHeight?: number;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  font?: string;
  color?: string;
  globalAlpha?: number;
  rotate?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  backgroundPosition?: string;
  watermark?: HTMLElement | null;
  watermarkObserve?: MutationObserver | null;
  bodyObserve?: MutationObserver | null;
  verify?: string;
  image?: string;
  dynamicWidthHeight?: {
    width: number;
    height: number;
    contentWidth: number;
    tipWidth: number;
  };
  onSuccess?: () => void;
  onWatermarkNullProp?: () => void;
  onDestory?: () => void;
  HSALPWATERMARK?: boolean;

  constructor(props: Props) {
    if (this.HSALPWATERMARK) return;
    const {
      content,
      tip,
      image,
      imageWidth = 160,
      imageHeight = 160,
      verify,
      fontSize = 14,
      fontFamily,
      fontWeight,
      color,
      alpha,
      width = 160,
      height = 160,
      maxWidth = 320,
      maxHeight = 320,
      rotate = 0,
      zIndex,
      backgroundPosition,
      onSuccess,
      onWatermarkNull,
      onDestory,
    } = props;

    if (!this.validContentOrImage(content, image, onWatermarkNull)) {
      return;
    }

    this.content = content; // 水印文本【**`与image必填其一`**】
    this.tip = tip; // 水印副本提示
    this.contentImage = image; // 水印图片【**`与content必填其一`**】
    this.onWatermarkNullProp = onWatermarkNull;
    this.imageWidth = imageWidth; // 水印图片宽度
    this.imageHeight = imageHeight; // 水印图片高度
    this.fontWeight = fontWeight || 'normal'; // 字体的粗细
    this.fontSize = `${fontSize}px`; // font-size px
    this.fontFamily = fontFamily || 'Licium, sans-serif'; // font-family
    this.font = `${this.fontWeight} ${this.fontSize} ${this.fontFamily}`;
    this.color = color || '#666666'; // 水印文本颜色
    this.globalAlpha = alpha || 0.1; // 水印文本透明度 0~1 0 表示完全透明，1 表示完全不透明
    this.rotate = (rotate * Math.PI) / 180; // 水印旋转弧度，以左上角为原点旋转，注意旋转角度影响水印文本显示
    // 水印动态宽高
    this.dynamicWidthHeight = this.getDynamicWidthHeight({
      content: this.content,
      tip: this.tip,
      contentImage: this.contentImage,
      imageWidth: this.imageWidth,
      imageHeight: this.imageHeight,
      fontWeight: this.fontWeight,
      fontSize,
      fontFamily: this.fontFamily,
      rotate,
      width,
      height,
      maxWidth,
      maxHeight,
    });
    this.width = this.dynamicWidthHeight.width; // 单个水印宽度 px
    this.height = this.dynamicWidthHeight.height; // 单个水印高度 px
    this.zIndex = zIndex || 2147483647; // z-index
    this.backgroundPosition = backgroundPosition || '0px 0px, 0px 0px'; // 水印背景图片位置 background-position
    this.watermark = null; // 水印 dom

    this.onSuccess = onSuccess;
    this.onDestory = onDestory;
    this.watermarkObserve = null; // 水印节点监听
    this.bodyObserve = null; // body监听
    this.verify = verify; // 对比文本是否一致
    this.image = '';
  }

  /**
   *
   * 必要参数校验：\
   * if(!this.validContentOrImage()){ \
   *    // 未通过不继续执行绘制等方法。 \
   *    return \
   * }
   *
   * @param content 水印文字
   * @param image 水印问题
   * @param onWatermarkNull 异常处理回调
   * @returns
   */
  validContentOrImage(
    content = this.content,
    image = this.contentImage,
    onWatermarkNull = this.onWatermarkNullProp
  ) {
    if (!`${content || ''}` && !image) {
      if (typeof onWatermarkNull === 'function') {
        onWatermarkNull();
      } else {
        this.defaultWatermarkNull?.();
      }
      return false;
    }
    return true;
  }

  // 获取水印动态宽高
  getDynamicWidthHeight = ({
    contentImage,
    imageWidth,
    imageHeight,
    content,
    tip,
    fontWeight,
    fontSize = 12,
    fontFamily,
    rotate,
    width = 100,
    height = 100,
    maxWidth = 500,
    maxHeight = 500,
  }: {
    contentImage?: string;
    imageWidth?: number;
    imageHeight?: number;
    content?: string;
    tip?: string;
    fontWeight?: string;
    fontSize?: number;
    fontFamily?: string;
    rotate?: number;
    width?: number;
    height?: number;
    maxWidth?: number;
    maxHeight?: number;
  }) => {
    let contentTag;

    if (content) {
      contentTag = document.createElement('span');
      contentTag.setAttribute('id', 'content-tag');
      contentTag.style.cssText = `
        visibility: hidden;
        font-weight: ${fontWeight};
        font-size: ${fontSize}px;
        font-family: ${fontFamily};
      `;
      contentTag.innerText = content;
      document.body.appendChild(contentTag);
    } else {
      contentTag = document.createElement('img');
      contentTag.setAttribute('id', 'content-tag');
      contentTag.style.cssText = `
        visibility: hidden;
        width: ${imageWidth};
        height: ${imageHeight};
      `;
      contentImage && (contentTag.src = contentImage);
      document.body.appendChild(contentTag);
    }
    const remRotate = (rotate || 0) % 360; // 取余旋转角度
    const radian = (360 - remRotate) * (Math.PI / 180); // 水印倾斜弧度
    const watermarkContentOffsetWidth = contentTag.offsetWidth; // 水印文本元素宽度
    // eslint-disable-next-line max-len
    let contentWidth = Math.ceil(Math.abs(Math.cos(radian) * watermarkContentOffsetWidth)) + fontSize; // 单个水印宽度
    // eslint-disable-next-line max-len
    const contentHeight = Math.ceil(Math.abs(Math.sin(radian) * watermarkContentOffsetWidth)) + fontSize; // 单个水印高度

    // =======================tip=========================
    let watermarkTipOffsetWidth = 0;
    let tipWidth = 0; // 单个水印tip宽度
    let tipHeight = 0; // 单个水印tip高度
    if (tip) {
      contentTag.innerText = tip;
      watermarkTipOffsetWidth = contentTag.offsetWidth; // 水印文本元素宽度
      // eslint-disable-next-line max-len
      tipWidth = Math.ceil(Math.abs(Math.cos(radian) * watermarkTipOffsetWidth)) + fontSize; // 单个水印content宽度
      // eslint-disable-next-line max-len
      tipHeight = Math.ceil(Math.abs(Math.sin(radian) * watermarkTipOffsetWidth)) + fontSize; // 单个水印content高度
      if (tipWidth < width) {
        tipWidth = width;
      } else if (tipWidth > maxWidth) {
        tipWidth = maxWidth;
      }
    }

    contentTag.remove();

    // 设置宽度限制值，最大与最小
    if (contentWidth < width) {
      contentWidth = width;
    } else if (contentWidth > maxWidth) {
      contentWidth = maxWidth;
    }

    // 获取两个文本中最大高度
    let h = Math.max(contentHeight, tipHeight);
    // 设置高度限制值，最大与最小
    if (h < height) {
      h = height;
    } else if (h > maxHeight) {
      h = maxHeight;
    }

    return {
      width: contentWidth + tipWidth,
      height: h,
      contentWidth,
      tipWidth,
    };
  };

  // 处理水印消失、内容与原文本不一致或者创建失败
  onWatermarkNull = () => {
    if (this.onWatermarkNullProp) {
      this.onWatermarkNullProp?.();
    } else {
      this.defaultWatermarkNull?.();
    }
  };

  // 创建高清Canvas
  createHDCanvas = (width = 300, height = 150) => {
    const ratio = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.width = width * ratio; // 实际渲染像素
    canvas.height = height * ratio; // 实际渲染像素
    canvas.style.width = `${width}px`; // 控制显示大小
    canvas.style.height = `${height}px`; // 控制显示大小
    canvas!.getContext('2d')!.setTransform(ratio, 0, 0, ratio, 0, 0);
    return canvas;
  };

  // canvas画文字
  draw(): Promise<HTMLCanvasElement | string | null> {
    if (!this.validContentOrImage()) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      // 1.创建canvas元素
      const canvas = this.createHDCanvas(this.width, this.height);
      // 2.获取上下文
      const context = canvas.getContext('2d');
      if (!context) return;

      if (this.verify && this.content !== this.verify) {
        this.onWatermarkNull?.();
      }

      if (this.content) {
        // 3.配置画笔🖌
        context.font = this.font!;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        // 填充色
        context.fillStyle = this.color!;
        // 设置全局画笔透明度
        context.globalAlpha = this.globalAlpha!;
        if (this.tip) {
          // 保存当前的绘图上下文
          context.save();
          // 平移转换，修改原点
          context.translate(this.dynamicWidthHeight!.contentWidth / 2, this.height! / 2);
          // 旋转转换(弧度数)
          context.rotate(this.rotate!);
          // 实心文字fillText(文字内容,文字左下角的X坐标,文字左下角的Y坐标);
          context.fillText(this.content, 0, 0);
          // 恢复之前保存的绘图上下文
          context.restore();
          // 保存当前的绘图上下文
          context.save();
          // 平移转换，修改原点
          context.translate(
            this.dynamicWidthHeight!.tipWidth / 2 + this.dynamicWidthHeight!.contentWidth,
            this.height! / 2
          );
          // 旋转转换(弧度数)
          context.rotate(this.rotate!);
          // 实心文字fillText(文字内容,文字左下角的X坐标,文字左下角的Y坐标);
          context.fillText(this.tip, 0, 0);
          // 恢复之前保存的绘图上下文
          context.restore();
        } else {
          // 平移转换，修改原点
          context.translate(this.width! / 2, this.height! / 2);
          // 旋转转换(弧度数)
          context.rotate(this.rotate!);
          // 实心文字fillText(文字内容,文字左下角的X坐标,文字左下角的Y坐标);
          context.fillText(this.content, 0, 0);
        }
        resolve(canvas);
      } else if (this.contentImage) {
        canvas.remove();
        // 保存当前的绘图上下文
        resolve(this.contentImage);
      }
    });
  }

  // canvas 转 image
  async getImage() {
    let image: string = '';
    try {
      const canvas = await this.draw();
      if (!canvas) return;
      if (typeof canvas === 'string') return canvas;
      image = canvas.toDataURL('image/png', 1);
      canvas.remove();
    } catch (err) {
      this.onWatermarkNull?.();
    }
    return image;
  }

  // 生成水印节点
  create = async () => {
    if (this.HSALPWATERMARK) return;

    if (!this.validContentOrImage()) {
      return null;
    }

    this.HSALPWATERMARK = true;
    this.image = this.image || (await this.getImage()); // 水印图片 【位置保持在最后，因为这里是函数调用】

    try {
      this.watermarkObserve?.disconnect?.();
      this.bodyObserve?.disconnect?.();

      this.watermark = document.createElement('div');
      const watermarkInner = document.createElement('div');

      // 占用影响水印显示的css 属性
      this.watermark.style.cssText = `
        display: block !important;
        z-index: ${this.zIndex} !important;
        height: auto !important;
        width: auto !important;
        top: auto !important;
        left: auto !important;
        right: auto !important;
        bottom: auto !important;
        background: none;
        visibility: visible !important;
        transform: none !important;
        opacity: 1 !important;
      `;

      watermarkInner.style.cssText = `
        display: block !important;
        z-index: ${this.zIndex} !important;
        position: fixed !important;
        pointer-events: none !important;
        height: 100% !important;
        width: 100% !important;
        top: 0 !important;
        left: 0 !important;
        background-image: url(${this.image}) !important;
        background-size: ${this.width}px ${this.height}px !important;
        background-repeat: repeat !important;
        background-position: ${this.backgroundPosition} !important;
        visibility: visible !important;
        transform: none !important;
        right: auto !important;
        bottom: auto !important;
        opacity: ${this.contentImage ? 0 : 1} !important;
        -webkit-print-color-adjust: exact;
        transition: opacity 1s;
      `;

      this.watermark.append(watermarkInner);
      document.body?.appendChild?.(this.watermark);

      setTimeout(() => {
        watermarkInner.style.opacity = '1';
        this.observeWatermarkInnerDom();
        this.bodyObserveWatermarkDom();
      }, 10);

      this.onSuccess?.();
    } catch {
      this.HSALPWATERMARK = false;
      this.onWatermarkNull?.();
    }
  };

  // 销毁水印
  destroy = () => {
    this.watermarkObserve?.disconnect?.();
    this.bodyObserve?.disconnect?.();
    this.watermark?.remove();
    this.HSALPWATERMARK = false;
    this.image = '';
    this.onDestory?.();
  };

  // 监听水印节点dom变化，重新渲染
  observeWatermarkInnerDom = () => {
    // 选择需要观察变动的节点
    const targetNode = this.watermark;

    // 观察器的配置（需要观察什么变动）
    // subtree：是否监听子节点的变化
    const config = {
      attributes: true,
      childList: true,
      subtree: true,
    };

    try {
      // 创建一个观察器实例并传入回调函数
      // 当观察到变动时执行的回调函数
      const observer = new MutationObserver((mutationsList) => {
        let isChangeWaterMark = false;
        mutationsList.forEach(() => {
          isChangeWaterMark = true;
        });
        if (isChangeWaterMark) {
          this.destroy();
          this.create();
        }
      });

      // 以上述配置开始观察目标节点
      targetNode && observer.observe(targetNode, config);

      this.watermarkObserve = observer;
    } catch {
      this.onWatermarkNull?.();
    }

    // 之后，可停止观察
    // observer.disconnect();
  };

  // 监听水印节点dom变化，重新渲染
  bodyObserveWatermarkDom = () => {
    // 选择将观察突变的节点
    const targetNode = document.querySelector('body');

    // 观察者的选项(观察哪些突变)
    // subtree：是否监听子节点的变化
    const config = {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    };

    // 创建一个观察者实例并添加回调函数
    // 当观察到突变时执行的回调函数
    const observer = new MutationObserver((mutationsList) => {
      let isChangeWaterMark = false;
      mutationsList.forEach((item) => {
        if (item.target === this.watermark) {
          isChangeWaterMark = true;
          return;
        }
        if (item.removedNodes.length && item.removedNodes[0] === this.watermark) {
          isChangeWaterMark = true;
        }
      });
      if (isChangeWaterMark) {
        this.destroy();
        this.create();
      }
    });
    // 根据配置开始观察目标节点的突变
    targetNode && observer.observe(targetNode, config);
    this.bodyObserve = observer;
  };

  // 水印消失或者创建失败后的默认回调
  defaultWatermarkNull = () => {
    console.warn('security issue');
  };
}

export default Watermark;
