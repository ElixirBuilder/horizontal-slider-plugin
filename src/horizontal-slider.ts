import { KulpElement, html, css, register, prop } from 'kulp-kit';

@register("horizontal-slider-cards.horizontal-slider")
export class HorizontalCardsSlider extends KulpElement {
    @prop({ type: Boolean }) showArrows = false;
    @prop({ type: Boolean }) startAgainAfterEnd = false;
    @prop({ type: Boolean }) autoScroll = false;
    @prop({ type: Number }) autoScrollSeconds = 2;
    @prop({ type: Number }) itemsToScroll = 1;
    @prop({ type: Boolean }) pauseOnHover = false;

    autoScrollingStarted = false;
    hovering = false;

    static styles = css`
        :root { 
            --_icon-size: 15px;
        }
        :host {
            display: block;
            overflow: hidden;
            width: 100%;
            height: 100%;
            position: relative;
        }
        .slider-container {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            scrollbar-width: none; /* Firefox */
        }
        .slider-container::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
        }
        ::slotted(*) {
            flex: 0 0 auto;
            pointer-events: cursor;
        }
        .arrow {
            display: none;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            padding: 10px;
            cursor: pointer;
            z-index: 1;
        }
        :host(:hover) .arrow {
            display: block;
        }
        .arrow-left {
            left: 0;
        }
        .arrow-right {
            right: 0;
        }
        .arrows { 
            text-align: end;
            display: flex;
            justify-content: end;
        }
        /* need a flat rounded button with hover effect */
        .icon-button {
            background-color: transparent;
            border: none;
            cursor: pointer;
            border-radius: 100%;
            transition: background-color 0.3s;
        }
        .icon-button:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
    `;

    connectedCallback(): void {
        super.connectedCallback();
        if (this.autoScroll) {
            this.startAutoScrolling(this.autoScrollSeconds);
        }
    }

    // execute startAutoScrolling after the properties are updated 
    updated(changedProperties: Map<string | number | symbol, unknown>): void {
        super.updated(changedProperties);
        if (changedProperties.has("autoScroll") && this.autoScroll && !this.autoScrollingStarted) {
            this.startAutoScrolling(this.autoScrollSeconds);
        }
    }

    getSliderChildWidth() {
        const firstChild = this.shadowRoot?.querySelector("slot")?.assignedElements()[0] as HTMLElement;
        return firstChild ? firstChild.offsetWidth : 0;
    }

    scrollToLeft() {
        // scroll the slider container smoothly towards the left only if possible
        const sliderContainer = this.shadowRoot?.querySelector(".slider-container") as HTMLElement;
        if (!sliderContainer) return;
        if (sliderContainer.scrollLeft > 0) {
            sliderContainer.scrollTo({
                left: sliderContainer.scrollLeft - (this.getSliderChildWidth() * this.itemsToScroll),
                behavior: "smooth"
            });
        }
    }

    scrollToRight() {
        // scroll the slider container smoothly towards the right only if possible
        const sliderContainer = this.shadowRoot?.querySelector(".slider-container") as HTMLElement;
        if (!sliderContainer) return;
        if (sliderContainer.scrollLeft < sliderContainer.scrollWidth - sliderContainer.clientWidth) {
            sliderContainer.scrollTo({
                left: sliderContainer.scrollLeft + (this.getSliderChildWidth() * this.itemsToScroll),
                behavior: "smooth"
            });
        }
        else {
            if (sliderContainer.scrollLeft === sliderContainer.scrollWidth - sliderContainer.clientWidth && this.startAgainAfterEnd) {
                sliderContainer.scrollTo({
                    left: 0,
                    behavior: "smooth"
                });
            }
        }
    }

    startAutoScrolling(seconds: number) {
        if (this.autoScrollingStarted) return;
        this.scrollToRight();
        setInterval(() => {
            if (this.pauseOnHover && this.hovering) return
            this.scrollToRight();
        }, seconds * 1000);
        this.autoScrollingStarted = true;
    }

    setHovering(value: boolean) {
        this.hovering = value;
    }

    elements = {
        arrows: html`
            <div class="arrows">
                <button class="icon-button" @click=${this.scrollToLeft}><i class="fas fa-chevron-left fa-sm"></i></button>
                <button class="icon-button" @click=${this.scrollToRight}><i class="fas fa-chevron-right fa-sm"></i></button>            
            </div>`
    }

    render() {
        return html`
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
            ${this.showArrows ? this.elements.arrows : null}
            <div class="slider-container" @mouseover=${() => this.setHovering(true)} @mouseout=${() => this.setHovering(false)}>
                <slot></slot>
            </div>
        `;
    }
}
