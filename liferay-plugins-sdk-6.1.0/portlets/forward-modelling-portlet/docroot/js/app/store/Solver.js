var solvers = [{
  "abbr": "SPECFEM3D_CARTESIAN_21447",
  "name": "SPECFEM3D_CARTESIAN_21447",
  "doc": "https://github.com/geodynamics/specfem3d/raw/devel/doc/USER_MANUAL/manual_SPECFEM3D_Cartesian.pdf"
},
{
	  "abbr": "SPECFEM3D_CARTESIAN_202_DEV",
	  "name": "SPECFEM3D_CARTESIAN_202_DEV",
	  "doc": "https://github.com/geodynamics/specfem3d/raw/devel/doc/USER_MANUAL/manual_SPECFEM3D_Cartesian.pdf"
	}];

Ext.define('CF.store.Solver', {
  extend: 'Ext.data.Store',
  model: 'CF.model.Solver',
  data: solvers
});