import { KulpElement, html, css, register, prop } from 'kulp-kit';
import { state } from 'lit/decorators.js';

@register("horizontal-slider-cards.horizontal-slider")
export class HorizontalCardsSlider extends KulpElement {
    @prop({ type: Boolean }) showArrows = false;
    @prop({ type: Boolean }) startAgainAfterEnd = false;
    @prop({ type: Boolean }) autoScroll = false;
    @prop({ type: Number }) autoScrollSeconds = 2;
    @prop({ type: Number }) itemsToScroll = 1;
    @prop({ type: Boolean }) pauseOnHover = false;
    @prop({ type: Boolean }) showDots = false;

    @state() currentIndex = 0;

    @state() totalItems = 0;

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
        .dots {
            display: flex;
            justify-content: center;
            padding: 10px 0;
        }
        .dot {
            cursor: pointer;
            height: 10px;
            width: 10px;
            margin: 0 5px;
            background-color: #bbb;
            border-radius: 50%;
            display: inline-block;
            transition: background-color 0.3s;
        }
        .dot.active {
            background-color: #717171;
        }
    `;

    connectedCallback(): void {
        super.connectedCallback();
        this.getTotalItems();
        this.updateDots();
        if (this.autoScroll) {
            this.startAutoScrolling(this.autoScrollSeconds);
        }
        // also add an event listener which says that after each slot change, update the dots
        const slot = this.shadowRoot?.querySelector("slot");
        slot?.addEventListener("slotchange", () => {
            this.getTotalItems();
            this.updateDots();
        });
        setTimeout(() => {this.getTotalItems(); this.updateDots()}, 1000)
    }


    updated(changedProperties: Map<string | number | symbol, unknown>): void {
        super.updated(changedProperties);
        this.getTotalItems();
        this.updateDots();
        if (changedProperties.has("autoScroll") && this.autoScroll && !this.autoScrollingStarted) {
            this.startAutoScrolling(this.autoScrollSeconds);
        }
    }

    getSliderChildWidth() {
        const firstChild = this.shadowRoot?.querySelector("slot")?.assignedElements()[0] as HTMLElement;
        return firstChild ? firstChild.offsetWidth : 0;
    }

    scrollToLeft() {
        const sliderContainer = this.shadowRoot?.querySelector(".slider-container") as HTMLElement;
        if (!sliderContainer) return;
        if (sliderContainer.scrollLeft > 0) {
            sliderContainer.scrollTo({
                left: sliderContainer.scrollLeft - (this.getSliderChildWidth() * this.itemsToScroll),
                behavior: "smooth"
            });
        }

        this.currentIndex = this.currentIndex - this.itemsToScroll;
        this.updateDots();

    }

    scrollToRight() {
        const sliderContainer = this.shadowRoot?.querySelector(".slider-container") as HTMLElement;
        if (!sliderContainer) return;
        console.log("Scroll left: ", sliderContainer.scrollLeft)
        if (sliderContainer.scrollLeft < sliderContainer.scrollWidth - sliderContainer.clientWidth) {
            sliderContainer.scrollTo({
                left: sliderContainer.scrollLeft + (this.getSliderChildWidth() * this.itemsToScroll),
                behavior: "smooth"
            });
        } else if (sliderContainer.scrollLeft === sliderContainer.scrollWidth - sliderContainer.clientWidth && this.startAgainAfterEnd) {
            sliderContainer.scrollTo({
                left: 0,
                behavior: "smooth"
            });
            this.currentIndex = 0;
            this.updateDots();
            return;
        }
        this.currentIndex = this.currentIndex + this.itemsToScroll;
        this.updateDots();
    }

    startAutoScrolling(seconds: number) {
        if (this.autoScrollingStarted) return;
        this.scrollToRight();
        setInterval(() => {
            if (this.pauseOnHover && this.hovering) return;
            this.scrollToRight();
        }, seconds * 1000);
        this.autoScrollingStarted = true;
    }

    setHovering(value: boolean) {
        this.hovering = value;
    }

    getTotalItems() {
        console.log("Getting total items")
        const slot = this.shadowRoot?.querySelector("slot");
        const totalItems = slot ? slot.assignedElements().length : 0;
        console.log(totalItems);
        this.totalItems = totalItems;
    }

    updateDots() {
        const dots = this.shadowRoot?.querySelectorAll('.dot');
        dots?.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    // updateDots() {
    //     const sliderContainer = this.shadowRoot?.querySelector(".slider-container") as HTMLElement;
    //     if (!sliderContainer) return;
    //     this.totalItems = this.getTotalItems();

    //     this.requestUpdate()
    //     const dots = this.shadowRoot?.querySelectorAll('.dot');
    //     dots?.forEach((dot, index) => {
    //         dot.classList.toggle('active', index === this.getCurrentIndex());
    //     });
    // }

    handleDotClick(index: number) {
        const sliderContainer = this.shadowRoot?.querySelector(".slider-container") as HTMLElement;
        if (!sliderContainer) return;
        const itemWidth = this.getSliderChildWidth();
        sliderContainer.scrollTo({
            left: itemWidth * index,
            behavior: "smooth"
        });
        this.currentIndex = index;
        this.updateDots();
    }

    render() {
        return html`
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
            ${this.showArrows ? html`
            <div class="arrows">
                <button class="icon-button" @click=${this.scrollToLeft}><i class="fas fa-chevron-left fa-sm"></i></button>
                <button class="icon-button" @click=${this.scrollToRight}><i class="fas fa-chevron-right fa-sm"></i></button>            
            </div>` : null}
            <div class="slider-container" @mouseover=${() => this.setHovering(true)} @mouseout=${() => this.setHovering(false)}>
                <slot></slot>
            </div>
            ${this.showDots ? html`
            <div class="dots">
                ${Array.from({ length: this.totalItems }).map((_, index) => html`
                    <span class="dot" @click=${() => this.handleDotClick(index)}></span>
                `)}
            </div>` : null}
        `;
    }
}
