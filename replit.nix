{ pkgs }: {
	deps = [
   pkgs.nodejs-19_x
    pkgs.yarn
    pkgs.replitPackages.jest
    pkgs.chromium
	];
}