module.exports = {
  feather: (icon) => {
    return `<svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-${icon}"
          >
            <use xlink:href="dist/feather-sprite.svg#${icon}"/>
        </svg>`;
  },
};
